Social feed app.

## Getting Started

First, make sure you have NodeJs and npm installed gloabally then run npm i in the root directory of project to get all the dependencies:

```bash
npm i
# or
npm install
```

Second, connect your database with the connection string store it in the .env file. Then run the below command:
(Use Aiven/Neon.tech or anyother provider of your choice to connect with the postgres db)

```bash
# To migrate and generate client

npx prisma migrate dev

# To seed sample data into database or else you can create your own data through UI or backend calls.

npx prisma db seed
```

If you seeded sample data into the database.
Below are the credentials of the sample users to interact with the UI or Backend calls.

```bash
Email:- john@example.com
password:- hashed_password_1

Email:- jane@example.com
password:- hashed_password_2

Email:- alice@example.com
password:- hashed_password_3
```

Third, Run this command at root to start the project

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
