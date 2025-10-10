import express from 'express';
import bodyParser from 'body-parser';
import slugify from 'slugify';

const app = express();
const port = process.env.PORT || 3000;

let posts = [
    {
        id: 1,
        title: "Welcome to My Blog",
        content: "This is the very first post on my new blog. I'm excited to share my thoughts and ideas with the world. Stay tuned for more content!",
        slug: "welcome-to-my-blog"
    },
    {
        id: 2,
        title: "A Guide to Modern JavaScript",
        content: "<h2>Arrow Functions & Promises</h2><p>Modern JavaScript has introduced powerful features. Arrow functions provide a concise syntax, while Promises help manage asynchronous operations gracefully. We'll dive deeper in future posts.</p>",
        slug: "a-guide-to-modern-javascript"
    },
    {
        id: 3,
        title: "Cooking Tips: The Perfect Pizza Dough!",
        content: "Making pizza dough from scratch is easier than you think! <blockquote>The secret to a great crust is a slow, cold fermentation in the refrigerator.</blockquote> It develops flavor and improves the texture.",
        slug: "cooking-tips-the-perfect-pizza-dough"
    }
];


let lastId = 4; 

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.render("index.ejs", { allPosts: posts });
});

app.get('/new', (req, res) => {
    res.render("new.ejs");
});

app.post("/", (req, res) => {
    const newPost = {
        id: lastId++,
        title: req.body.title,
        content: req.body.content,
        slug: slugify(req.body.title, { lower: true, strict: true })
    };
    posts.push(newPost);
    res.redirect("/");
});
app.get("/posts/:postSlug", (req, res) => {
    const requestedSlug = req.params.postSlug;
    const postIndex = posts.findIndex(post => post.slug === requestedSlug);

    if (postIndex > -1) {
        const post = posts[postIndex];
        res.render("post.ejs", {
            post: post,
            index: postIndex,
        });
    } else {
        res.status(404).send("Post not found");
    }
});

app.post("/delete/:id", (req, res) => {
  const postId = parseInt(req.params.id);
  const postIndex = posts.findIndex(post => post.id === postId);
  if (postIndex > -1) {
    posts.splice(postIndex, 1);
  } 
  res.redirect("/");
});

app.get("/edit/:id", (req, res) => {
    const postId = parseInt(req.params.id);
    const post = posts.find(p => p.id === postId);

    if (post) {
        res.render("edit.ejs", { post: post });
    } else {
        res.status(404).send("Post not found");
    }
});


app.post("/edit/:id", (req, res) => {
    const postId = parseInt(req.params.id);
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex > -1) {

        posts[postIndex].title = req.body.postTitle;
        posts[postIndex].content = req.body.postContent;

        posts[postIndex].slug = slugify(req.body.postTitle, { lower: true, strict: true });


        res.redirect(`/posts/${posts[postIndex].slug}`);
    } else {
        res.status(404).send("Post not found");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});