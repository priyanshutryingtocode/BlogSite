import express from 'express';
import bodyParser from 'body-parser';
import slugify from 'slugify';
import pg from 'pg';
import env from 'dotenv'; 

const app = express();
const port = 3000;

env.config(); 

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));


app.get('/', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM posts ORDER BY id ASC");
        const posts = result.rows; 
        res.render("index.ejs", { allPosts: posts });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching posts");
    }
});


app.get('/new', (req, res) => {
    res.render("new.ejs");
});


app.post("/", async (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    const slug = slugify(title, { lower: true, strict: true });

    try {
        await db.query(
            "INSERT INTO posts (title, content, slug) VALUES ($1, $2, $3)",
            [title, content, slug]
        );
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating post");
    }
});


app.get("/posts/:postSlug", async (req, res) => {
    const requestedSlug = req.params.postSlug;

    try {
        const result = await db.query("SELECT * FROM posts WHERE slug = $1", [requestedSlug]);
        
        if (result.rows.length > 0) {
            const post = result.rows[0];
            res.render("post.ejs", {
                post: post,
                index: post.id, 
            });
        } else {
            res.status(404).send("Post not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


app.post("/delete/:id", async (req, res) => {
  const postId = parseInt(req.params.id);
  
  try {
      await db.query("DELETE FROM posts WHERE id = $1", [postId]);
      res.redirect("/");
  } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting post");
  }
});

app.get("/edit/:id", async (req, res) => {
    const postId = parseInt(req.params.id);

    try {
        const result = await db.query("SELECT * FROM posts WHERE id = $1", [postId]);
        if (result.rows.length > 0) {
            res.render("edit.ejs", { post: result.rows[0] });
        } else {
            res.status(404).send("Post not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

app.post("/edit/:id", async (req, res) => {
    const postId = parseInt(req.params.id);
    const title = req.body.postTitle;
    const content = req.body.postContent;
    const slug = slugify(title, { lower: true, strict: true });

    try {
        await db.query(
            "UPDATE posts SET title = $1, content = $2, slug = $3 WHERE id = $4",
            [title, content, slug, postId]
        );
        res.redirect(`/posts/${slug}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating post");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});