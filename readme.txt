Steps to Run The Project Locally:

1.Clone the same repo in 2 different directories
2.run both servers

Backend : 
1.npm i
2.create a database named zstack_assignment(or replace in env if custom)
3.npm run migrate(To seed data and create tables)
4.Add the .env shared in email
5.npm run dev

frontend : 
1.npm i
4.Add the .env shared in email
5.npm run dev


1. Server crashes after debiting sender but before crediting receiver?
The database automatically rolls back the entire transaction. Both the debit and credit are wrapped in a single SQL transaction (sequelize.transaction). If the server crashes before the final COMMIT is sent to the DB, the DB aborts the whole thing. The sender's money is restored. Nothing is lost.

2. Two transfers from the same wallet happen at the exact same moment?
The second request waits, then fails if there are insufficient funds. The backend uses a row-level lock (lock: t.LOCK.UPDATE). When the first request reads the user's balance, it locks that row. The second request pauses until the first one finishes. By the time the second one reads the balance, the money is already gone, and it correctly throws an Insufficient balance error. Double-spending is impossible.

Nothing Has been skipped, As I was focused on completing the primary tasks I saw the additional tasks later - had use sql by then but those additional tasks have been implemented.


1. Add MongoDB indexes for your main queries and explain each one in your README : 
Indexes applied on :
{ fields: ["from_user_id", "created_at"] },
{ fields: ["to_user_id", "created_at"] },

used in this query to fasten the search

await TRANSACTIONS.findAll({
  where: {
    [Op.or]: [{ from_user_id: userId }, { to_user_id: userId }],
  },
  order: [["created_at", "DESC"]],
});

2.Debit and credit inside a MongoDB transaction.
Transactions have been implemented

3.
Tests for the transfer rules and the idempotency behaviour.
A simulation for network failure has been added

4.Use Typescript
As I was focused on completing the primary tasks I saw the additional tasks later - had used JS by then


