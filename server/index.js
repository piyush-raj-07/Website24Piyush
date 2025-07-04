const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoute');
const blogRoutes = require('./routes/blogRoutes');
const adminRoutes = require('./routes/adminRoute');
const quizRoutes = require('./routes/quizRoute');
const userRoutes = require('./routes/userRoute');
const cloudinary = require('cloudinary').v2;
const visitRoutes = require('./routes/analyticRoute')

const multer = require('multer');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

const ActivitiesModel = require('./models/Activities');
const UserModel = require('./models/Users');
const GalleryModel = require('./models/Gallery');
const NewsModel = require('./models/News');
const Blog = require('./models/Blogs');

app.use(cookieParser());
require('dotenv').config();
const mongoURI = process.env.CSTRING;

//paste cloudianry Config file here  , foe reference see line no: 150 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_name,
    api_key:  process.env.CLOUDINARY_api_key,
    api_secret: process.env.CLOUDINARY_api_secret,
  });
  
const PORT = 5000;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error: ', err));

// authentication routes
app.use("/api/auth", authRoutes);

app.use('/blog', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/user', userRoutes);
app.use("/api", visitRoutes);


// storing user info
app.post("/SaveUser", async (req, res) => {

    const {
        UserEmail,
        Name,
        password,
        Img_Url,
        Grad_Year,
        Degree,
        About,
        Blogs,
        is_Proj,
        Role } = req.body;

    const exist = await UserModel.findOne({ UserEmail });
    if (exist) {
        return res.status(200).send("User already exists");
    }
    try {

        const NewUser = new UserModel(
            {
                UserEmail,
                Name,
                password,
                Img_Url,
                Grad_Year,
                Degree,
                About,
                Blogs,
                is_Proj,
                Role
            }
        );
        await NewUser.save();
        res.send("Data Inserted")
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).send("Error inserting data");
    }
})

app.get('/GetAllUsers', async (req, res) => {

    try {
        const data = await UserModel.find();
        res.send(data);
    } catch (err) {
        console.error('Error inserting data:', err);
    }


})

//News Data
app.post('/NewsData', async (req, res) => {

    const {
        Image_URL,
        Description,
        Act_Slider
    } = req.body;

    try {
        const newdata = new NewsModel({ Image_URL, Description, Act_Slider });
        const savedata = await newdata.save();
        res.status(201).json(savedata);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save data' });
    }
})

app.get('/GetData', async (req, res) => {
    try {
        const data = await NewsModel.find();
        res.send(data);
    } catch (error) {
        console.error('Error getting image', error);
    }
})

//Gallery
app.get('/GetGallery', async (req, res) => {
    try {
        const images = await GalleryModel.find();
        res.status(200).json(images);
    } catch (error) {
        console.log('err getting gallery', error);
    }
})

// Save Image in gallery
const streamifier = require("streamifier");

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/UploadImage", upload.single("Image"), async (req, res) => {
    try {

      const { title, subtitle } = req.body;
  
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: "Image file is missing or invalid." });
      }
  
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "Gallery" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };
  
      const result = await streamUpload(req.file.buffer);
  
      const newImage = new GalleryModel({
        url: result.secure_url,
        title,
        subtitle,
      });
  
      await newImage.save();
  
      res.json({
        message: "Image uploaded successfully!",
        imageUrl: result.secure_url,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed", details: error.message });
    }
  });
  

  
app.get('/GetActivity', async (req, res) => {
    try {
     
        const activities = await ActivitiesModel.find();
      
        res.status(200).json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: error.message });
    }
});


app.put('/EditActivity/:id', async (req, res) => {
    const { id } = req.params;
    const { url1, url2, title, description } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Activity ID is required' });
    }

    try {
        const updatedActivity = await ActivitiesModel.findByIdAndUpdate(
            id,
            { url1, url2, title, description },
            { new: true }
        );

        if (!updatedActivity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

   
        res.status(200).json(updatedActivity);
    } catch (error) {
        console.error('Error updating activity:', error);
        res.status(500).json({ error: 'Failed to update activity' });
    }
});


app.post('/SaveActivity', async (req, res) => {

    const {
        url1, url2, title, description
    } = req.body;

    try {
        const newImage = new ActivitiesModel({
            url1,
            url2,
            title,
            description,
        });
        await newImage.save();
        res.status(201).json("img saved");
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to save image' });
    }
})


app.delete('/DeleteActivity/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedActivity = await ActivitiesModel.findByIdAndDelete(id);

        if (!deletedActivity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        console.log('Activity deleted:', deletedActivity);
        res.status(200).json({ message: 'Activity deleted successfully' });
    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({ error: 'Failed to delete activity' });
    }
});

// Quiz data
app.post('/Quizdata', async (req, res) => {

    const {
        Question,
        Options,
        CorrectAnswerIndex
    } = req.body

    try {
        const newques = new QnAModel({ Question, Options, CorrectAnswerIndex });
        const saveques = await newques.save();
        res.status(201).json(saveques);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to save question' });
    }
})

app.get('/GetQuestion', async (req, res) => {
    try {
        const ques = await QnAModel.find();
        res.send(ques);
    } catch (error) {
        console.error('Error getting question', error);
    }
})
// api to get any one user data

app.get('/user/:id', async (req, res) => {
    const { id } = req.params;
   
    const userdetail = await UserModel.findById(id);

    if (userdetail) {
        res.status(200).json(userdetail);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

app.post('/user/blogs', async (req, res) => {
    try {
        const { author_id } = req.body; // Get author_id from request body
        if (!author_id) {
            return res.status(400).json({ error: 'Author ID is required' });
        }

        const blogs = await Blog.find({ author_id: author_id });

        if (!blogs.length) {
            return res.status(404).json({ message: 'No blogs found for this user' });
        }

        res.status(200).json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(PORT, () => {
    console.log("SERVER STARTED ");
});


