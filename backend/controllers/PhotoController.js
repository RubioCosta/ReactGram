const Photo = require("../models/Photo");
const mongoose = require("mongoose");
const User = require("../models/User");

// Inserir Fotos
const insertPhoto = async(req, res) => {
    
    const { title } = req.body
    const image = req.file.filename;

    const reqUser = req.user;

    const user = await User.findById(reqUser._id);

    // Criar Foto
    const newPhoto = await Photo.create({
        image,
        title,
        userId: user._id,
        userName: user.name
    });

    // Imagem criado com sucesso
    if (!newPhoto) {
        req.status(422).json({
            errors: ["Houve um problema, por favor tente novamente mais tarde."]
        })

        return;
    }

    res.status(201).json(newPhoto);
}

// Deletar Foto
const deletePhoto = async(req, res) => {

    const { id } = req.params;

    const reqUser = req.user;

    try {
        const photo = await Photo.findById(id);

        // Checar foto existe
        if(!photo) {
            res.status(400).json({
                errors: ["Foto não encontrada!"]
            });
    
            return;
        }
    
        // Checar foto User
        if(!photo.userId.equals(reqUser._id)) {
            res.status(422).json({
                errors: ["Ocorreu um erro, por favor tente novamente mais tarde."]
            });
    
            return;
        }
    
        await Photo.findByIdAndDelete(photo._id);
    
        res.status(200).json({
            id: photo._id,
            message: "Foto excluída com sucesso."
        });
    } catch(error) {
        res.status(400).json({
            errors: ["Foto não encontrada!"]
        });
    }

}

// Pegar todas as fotos
const getAllPhoto = async(req, res) => {

    const photos = await Photo.find({}).sort([["createdAt", -1]]).exec();

    return res.status(200).json(photos);

}

// Pegar Foto User
const getUserPhotos = async(req, res) => {
    
    const { id } = req.params;

    const photos = await Photo.find({ userId: id }).sort([["createdAt", -1]]).exec();

    return res.status(200).json(photos);

}

// Pegar foto pelo Id
const getPhotoById = async(req, res) => {

    const { id } = req.params;

    const photo = await Photo.findById(id);

    // Checar se existe
    if(!photo) {
        res.status(404).json({
            erros: ["Foto não enconstrada."]
        });

        return;
    }

    res.status(200).json(photo);

}

// Atualizar Foto
const updatePhoto = async(req, res) => {
    
    const { id } = req.params;
    const { title } = req.body;

    const reqUser = req.user;

    const photo = await Photo.findById(id);

    // Checar foto existe
    if (!photo) {
        res.status(404).json({
            errors: ["Foto não encontrada."]
        })

        return;
    }

    //Checar se foto pertence ao usuário
    if (!photo.userId.equals(reqUser._id)) {
        res.status(404).json({
            errors: ["Ocorreu um erro, por favor tente novamente mais tarde."]
        })

        return;
    }

    if (title) {
        photo.title = title;
    }

    await photo.save()

    res.status(200).json({photo, message: "Foto atualizada com sucesso!"});

}

// Função like foto
const likePhoto = async(req, res) => {
    
    const { id } = req.params;

    const reqUser = req.user;

    const photo = await Photo.findById(id)

    // Checar foto existe
    if (!photo) {
        res.status(404).json({
            errors: ["Foto não encontrada."]
        })

        return;
    }

    // Verificar se ja deu like
    if(photo.likes.includes(reqUser._id)){
        res.status(422).json({
            errors: ["Você já curtiu a foto."]
        })

        return;
    }

    // Adicionar id User array
    photo.likes.push(reqUser._id);

    photo.save();

    res.status(200).json({photoId: id, userId: reqUser._id, message: "A foto foi curtida"});

}

// Adicionar Comentário
const commentPhoto = async(req, res) => {

    const { id } = req.params;
    const { comment } = req.body;

    const reqUser = req.user;

    const user = await User.findById(reqUser._id);

    const photo = await Photo.findById(id);

    // Checar Foto
    if (!photo) {
        res.status(404).json({
            errors: ["Foto não encontrada."]
        });

        return;
    }

    // Adicionar comentário
    const userComment = {
        comment,
        userName: user.name,
        userImage: user.profileImage,
        userId: user._id
    };

    photo.comments.push(userComment);

    await photo.save();

    res.status(200).json({
        comment: userComment,
        message: "O comentário foi adicionado com sucesso!"
    })

}

const searchPhotos = async(req, res) => {
    
    const { q } = req.query;

    const photos = await Photo.find({ title: new RegExp(q, "i") }).exec();

    res.status(200).json(photos);

}

module.exports = {
    insertPhoto,
    deletePhoto,
    getAllPhoto,
    getUserPhotos,
    getPhotoById,
    updatePhoto,
    likePhoto,
    commentPhoto,
    searchPhotos
}