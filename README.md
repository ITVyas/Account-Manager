# Account Manager
#### Author: Viacheslav Rudametkin (slavoxhkaloo@gmail.com)
## What is it?
This is a local single-page project, which stands for managing accounts data:
- Store
- Access
- Delete
- Download backups
- Upload backups

Since this is an Account Manager, some features for comfortable and safe using were implemented.
## Features and GUI:
Page design illustrated below:

![image](https://github.com/user-attachments/assets/bfc913a8-7baf-4eb6-8729-467f7beee85e)

### Main user interface features:
- Search records by key words
- User-friendly records grouping
- Assigning names to records
- Short and expanded view
- Private fields are always hidden and can only be copied
- Compact design

Form for new record design:

![image](https://github.com/user-attachments/assets/8759da36-2a5e-44fe-92bb-92418d7ac991)

### Easy and flexible record form:

- Default fields created automatically
- Fields can be deleted
- Adding custom private or public fields
- Groups picking
- Choosing custom search words

### Extra features included:
- Download backup
- Erase all data
- Unpack backup

Backup unpacking form design:

![image](https://github.com/user-attachments/assets/c97fd03f-0533-4bba-b7b2-4e12260dc00b)

- Multiple unpack modes present

## How to use?
It is a local html single-page project. Download project folder, open index.html in your browser and save in your Bookmarks. Now you can easily access it any time.
> [!Note]
> The app was developed in Chrome, so this browser is preferred to use.

> [!Note]
> The data stored inside the browser, so don't afraid if you don't have any data in other browsers. Use the Backup and Restore features to transfer your data.

## Security
You might be wondering what kind of security is provided.
1. Modern browsers CORS policy, we shouldn't forget about it.
2. All Private fields are encrypted with AES-256 (AES-GCM), which is VERY ENOUGH secure algorithm.
   - We use a KEY PHRASE from 5 to 32 symbols and hashing SHA-256 to create 32-symbols key for AES
   - AES-GCM mode is used for safe storing of multiple encrypted private fields with the same KEY PHRASE
   - AES-GCM mode as well doesn't give any data if KEY PHRASE is wrong, so random 16-symbols values are created in this case

> [!CAUTION]
> The app allows you to use a 5-character KEY PHRASE, but for better security, a longer phrase (2–3 words) is strongly recommended. A weak key length can compromise your data.

3. Since app offers you flexible record design, you can easily create fully private record (so all you data will be encrypted)

![image](https://github.com/user-attachments/assets/af7f5480-4fa5-4968-bb2a-0b812278d443)

4. User interface is designed specially to prevent or, at least, have possibility to prevent any data leak even if you SHARE your screen:
   - Private fields in the main record list can only be copied.
   - Private fields in form are hidden by default (password mode).
   - The main page KEY PHRASE input has an additional blur effect. This reduces usability slightly but prevents others from determining the exact length of your phrase when watching you type. (As shown below)

![image](https://github.com/user-attachments/assets/01972f78-5327-4b35-b211-ae97b777793b)

5. After 3 minutes of inactivity, the KEY PHRASE field is automatically cleared and blurred for additional security.

> [!IMPORTANT]
> Despite your data have some high security protection, so you can even store your backup files on Desktop, you should always remain cautious. Follow basic cyber hygiene principles to stay safe online.






