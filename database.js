import mysql from "mysql2"
import dotenv from "dotenv"
dotenv.config()

const pool = mysql.createPool({
    // Using Environment Variables 
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

export async function getAllBooks() {
    // Destructuring Assignment
    const [rows] = await pool.query("SELECT * from books")
    return rows
}
export async function getBookTitle(Book_Id) {
    // Making use of a Prepared Statement
    const [rows] = await pool.query(`select Title from books where Book_Id = 1`, [Book_Id])
    return rows[0] 
}

export async function getBooksByGenre(genre) {
    const [rows] = await pool.query("SELECT * from books where Book_Genre = ?",[genre])
    return rows
}

export async function borrowBook(User_Id, Book_Id) {
    // Making use of a Prepared Statement
    const [rows] = await pool.query(
        `INSERT INTO borrowed_books(User_Id, Date_Borrowed, Date_Due, Book_Id) 
        VALUES(?,CURRENT_DATE(),CURRENT_DATE()+7,?)`, 
        [User_Id, Book_Id])
    //return rows.insertId
}

export async function getUserInfo(User_Id) {
    // Making use of a Prepared Statement
    const [rows] = await pool.query(
        `select * from borrowed_books where User_Id = ?`, [User_Id])
    //return rows.insertId
}

export async function registerUser(Name, Email, Password) {
    // Making use of a Prepared Statement
    const [rows] = await pool.query(`
        INSERT INTO users(Name, Email, Password) VALUES(?,?,?)`, 
        [Name, Email, Password])
    //return rows.insertId
}

export async function getUserID(name, email) {
    // Making use of a Prepared Statement
    const [rows] = await pool.query(`select User_Id From users where (Name = ? and Email= ?)`, [name, email])
    return rows[0] 
}

export async function getUser_byEmail(email) {
    // Making use of a Prepared Statement
    const [rows] = await pool.query(`select * from users where email = ?`, [email])
    return rows[0] 
}
