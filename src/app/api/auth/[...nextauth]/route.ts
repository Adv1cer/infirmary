import mysql from 'mysql2/promise';
import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth, { AuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


interface DBUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  role_name: string;
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: string;
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

type AuthorizedUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  role_id: string;
  token: string;
};

const dbConfig = {
  host: process.env.MYSQL_HOST || '',
  user: process.env.MYSQL_USER || '',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || '',
};

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials) {

        if (!credentials) {
          throw new Error('No credentials provided');
        }

        const { email, password } = credentials;

        try {
          const connection = await mysql.createConnection(dbConfig);

          const [rows] = await connection.execute<mysql.RowDataPacket[]>(
            `SELECT user.*, role.role_name 
             FROM user 
             LEFT JOIN role ON user.role_id = role.role_id 
             WHERE user.email = ?`,
            [email]
          );
          await connection.end();

          if (rows.length > 0) {
            const user = rows[0] as DBUser;
            console.log('User found:', user);
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
              const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role_name },
                process.env.NEXTAUTH_SECRET || 'default_secret',
                { expiresIn: '1h' }
              );

              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role_name,
                role_id: user.role,
                token,
              };
            } else {
              console.log('Password does not match.');
              throw new Error('Invalid email or password');
            }
          } else {
            console.log('No user found with this email.');
            throw new Error('Invalid email or password');
          }
        } catch (error) {
          console.error('Error in MySQL authentication:', error);
          throw new Error('Internal server error');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/Login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const typedUser = user as AuthorizedUser;
        token.id = typedUser.id;
        token.email = typedUser.email;
        token.name = typedUser.name;
        token.role = typedUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role,
        };
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
