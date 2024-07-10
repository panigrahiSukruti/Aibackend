const express = require('express');
const axios = require('axios');
const User = require('../models/user.js');
const Friend = require('../models/friend.js');

const router = express.Router();

// Create a new user
router.post('/users/:username', async (req, res) => {
    const { username } = req.params;
    console.log(username);
    const existingUser = await User.find({ username : username});
    
    if (!existingUser) {
        return res.status(400).json({ message: 'User already exists in the database' });
    }

    try {
        const response = await axios.get(`https://api.github.com/users/${username}`);
        let user = response.data;
        console.log(user);
        // const newUser = new User({
        //     username: user.login,
        //     name: user.name,
        //     location: user.location,
        //     bio: user.bio,
        //     public_repos: user.public_repos,
        //     public_gists: user.public_gists,
        //     followers: user.followers,
        //     following: user.following,
        //     created_at: user.created_at,
        // });

        // Save to database
        user = new User({ username, details: user });
        await user.save();
        res.status(201).send(user);

        
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add mutual friends
router.post('/users/:username/friends', async (req, res) => {
    const { username } = req.params;
    console.log(username);
    const user = await User.findOne({ username });

    

    try {
        if (!user) {
            res.status(404).json({ message: 'User not found' });
       }
        const followersResponse = await axios.get(`https://api.github.com/users/${username}/followers`);
        
        const followingResponse = await axios.get(`https://api.github.com/users/${username}/following`);

        const followers = followersResponse.data.map(f => f.login);
        const following = followingResponse.data.map(f => f.login);

        const mutualFriends = followers.filter(f => following.includes(f));

        for (const friendUsername of mutualFriends) {
            const friend = await User.findOne({ username: friendUsername });
            if (friend) {
                const newFriend = new Friend({ user: user._id, friend: friend._id });
                await newFriend.save();
            }
        }

        res.status(200).json({ message: 'Mutual friends added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});

// Get users sorted by a specific field
router.get('/:sortBy', async (req, res) => {
    const { sortBy } = req.params;
    console.log(req.params);
    // const { sortBy } = req.query;
    const validSortFields = ['public_repos', 'public_gists', 'followers', 'following', 'created_at'];

    if (!validSortFields.includes(sortBy)) {
        return res.status(400).json({ message: 'Invalid sort field' });
    }

    const users = await User.find().sort({ [sortBy]: 1 });

    res.status(200).json(users);
});

// Update a user
// router.put('/users/:username', async (req, res) => {
//     const { username } = req.params;
//     const { location, blog, bio } = req.body;

//     const user = await User.findOneAndUpdate(
//         { username },
//         { location, blog, bio, updated_at: new Date() },
//         { new: true }
//     );

//     res.status(200).json(user);
// });

router.put('/users/:username', async (req, res) => {
    const { username } = req.params;
    const updates = req.body;

    const user = await User.findOneAndUpdate(
        { username },
        { $set: { 'details.location': updates.location, 'details.blog': updates.blog, 'details.bio': updates.bio } },
        { new: true }
    );

    if (!user) {
        return res.status(404).send('User not found');
    }

    res.status(200).send(user);
});
// Soft delete a user
router.delete('/users/:username', async (req, res) => {
    const { username } = req.params;

    const user = await User.findOneAndUpdate(
        { username },
        { deleted: true },
        { new: true }
    );

    if (!user) {
        return res.status(404).send('User not found');
    }

    res.status(200).send('User soft deleted');
});

// Search users
router.get('/search', async (req, res) => {
    try {
        const { username, location } = req.query;
        const query = {};

        if (username) {
            query.username = { $regex: username, $options: 'i' }; // case-insensitive search
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' }; // case-insensitive search
        }

        const users = await User.find(query);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;
