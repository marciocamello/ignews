import { query as q } from 'faunadb';
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { fauna } from '../../../services/fauna';

export default NextAuth({
    // Configure one or more authentication providers
    providers: [
        GithubProvider({
            version: "v3",
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
            authorization: {
                params: {
                    scope: 'read:user',
                },
            },
        }),
    ],
    callbacks: {
        async session({ session, user, token }) {
            try {
                const userActiveSubscription = await fauna.query(
                    q.Get(
                        q.Intersection([
                            q.Match(
                                q.Index('subscription_by_user_ref'),
                                q.Select(
                                    'ref',
                                    q.Get(
                                        q.Match(
                                            q.Index('user_by_email'),
                                            q.Casefold(session.user.email)
                                        )
                                    )
                                )
                            ),
                            q.Match(
                                q.Index('subscription_by_status'),
                                "active"
                            )
                        ])
                    )
                );

                return {
                    ...session,
                    activeSubscription: userActiveSubscription,
                }
            } catch (e) {
                console.log(e);
                return {
                    ...session,
                    activeSubscription: null,
                }
            }
        },
        async signIn({ user }) {
            const { email } = user;

            try {

                await fauna.query(
                    q.If(
                        q.Not(
                            q.Exists(
                                q.Match(
                                    q.Index("user_by_email"),
                                    q.Casefold(email)
                                )
                            )
                        ),
                        q.Create(
                            q.Collection('users'),
                            { data: { email } }
                        ),
                        q.Get(
                            q.Match(
                                q.Index("user_by_email"),
                                q.Casefold(email)
                            )
                        )
                    )
                )

                return true
            } catch (err) {
                console.error(err)
                return false
            }
        },
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    }
})