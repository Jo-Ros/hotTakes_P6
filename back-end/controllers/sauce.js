const Sauce = require('../models/sauce');
const fs = require('fs');

// == Find better way to deal with errors (!"") ==
// ==============
exports.getAllSauces = async (req, res, next) => {
        try {
            const sauces = await Sauce.find();
            if(!sauces) return res.status(400).json({ error: 'Can Not Find Sauces!' });
            res.status(201).json(sauces);   
        } 
        catch (err) {
            console.error(`Error has occured: ${err}`);
            res.status(500).json({ message: `Error has occured: ${err}` })
        }
};

// ==============
exports.createSauce = async (req, res, next) => {
    try {
        const sauceObject = JSON.parse(req.body.sauce);
        delete sauceObject._id;
        const newSauce =  new Sauce({
            ...sauceObject,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            likes: 0,
            dislikes: 0,
            usersLiked: [""],
            usersDisliked: [""]
        });
        
        const sauce = await newSauce.save();

        if(!sauce) return res.status(400).json({ error: 'Sauce has not been loaded!' });
        res.status(201).json(({ message: 'Sauce loaded' }));
    }
    catch (err) {
        console.error(`Error has occured: ${err}`);
        res.status(500).json({ message: `Error has occured: ${err}` })
    }
};

// ==============
exports.getOneSauce = async (req, res, next) => {
    try {
        const singleSauce = await Sauce.findOne({ _id: req.params.id });

        if(!singleSauce) return res.status(404).json({ error: 'No such sauce' });
        res.status(200).json(singleSauce);
    }
    catch (err) {
        console.error(`Error has occured: ${err}`);
        res.status(500).json({ message: `Error has occured: ${err}` })
    }
};

// ==============
exports.modifySauce = async (req, res, next) => {
    try {
        let sauceObject;

        if (req.file) {
            const singleSauce = await Sauce.findOne({ _id: req.params.id });
            const filename = singleSauce.imageUrl.split('/images/')[1];
        
            fs.unlink(`images/${filename}`, (err) => {
                if(err) throw err;
            })
    
            sauceObject = 
            {
                ...JSON.parse(req.body.sauce),
                imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
            }
        }
    
        else {
            sauceObject = { ...req.body };
        }
    
        const updatedSauce = await Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id })
        res.status(200).json({ message: "Modified Sauce!" });
    }

    catch (err) {
        console.error(`Error has occured: ${err}`);
        res.status(500).json({ message: `Error has occured: ${err}` })
    }
};

// ============== 
exports.deleteSauce = async (req, res, next) => {
    try {
        const singleSauce = await Sauce.findOne({ _id: req.params.id })
        const filename = singleSauce.imageUrl.split('/images/')[1];
    
        fs.unlink(`images/${filename}`, async () => {
            const sauce = await Sauce.findOne({ _id: req.params.id })
            if(!sauce) {
                return res.status(404).json({ error: new Error('No such sauce')})
            }
            if(sauce.userId !== req.auth.userId) {
                return res.status(403).json({ error: new Error('Unauthorized request!')})
            }
    
            const dsauce = await Sauce.deleteOne({ _id: req.params.id })
                res.status(200).json({ message: 'Sauce has been deleted!'});
        })
    }
    catch (err) {
        console.error(`Error has occured: ${err}`);
        res.status(500).json({ message: `Error has occured: ${err}` })
    }
}

// ==============
exports.likeDislikeSauce = async (req, res, next) => {
    try {
        if (req.body.like === 1) {
            await Sauce.updateOne(
                { _id: req.params.id },
                { $inc: { likes: req.body.like++ }, $push: { usersLiked: req.body.userId } }
            );
            res.status(200).json({ message: "Like Added" });
        }
    
        else if (req.body.like === -1) {
            const sauce = await Sauce.updateOne(
                { _id: req.params.id },
                { $inc: { dislikes: req.body.like++ * -1 }, $push: { usersDisliked: req.body.userId } }
            );
            res.status(200).json({ message: "Dislike Added" });
        } 
        
        else {
            const sauce = await Sauce.findOne({ _id: req.params.id });
    
            if (sauce.usersLiked.includes(req.body.userId)) {
                const sauce = await Sauce.updateOne(
                    { _id: req.params.id },
                    { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
                );
                res.status(200).json({ message: "Like Deleted" });
            }
    
            else if (sauce.usersDisliked.includes(req.body.userId)) {
                const sauce = await Sauce.updateOne(
                    { _id: req.params.id },
                    { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } }
                );
                res.status(200).json({ message: "Dislike Deleted" });
            }
        }
    }
    catch (err) {
        console.error(`Error has occured: ${err}`);
        res.status(500).json({ message: `Error has occured: ${err}` })
    }
}
