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