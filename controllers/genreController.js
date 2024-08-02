const Book = require('../models/book');
const Genre = require("../models/genre");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require('express-validator');

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find().sort({ name: 1 }).exec();
  res.render("genre_list", {
    title: 'Genre List',
    genre_list: allGenres,
  });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, bookInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);
  if (genre === null) {
    const err = new Error('Genre not found');
    err.status = 404;
    return next(err);
  }

  res.render('genre_detail', {
    title: 'Genre Detail',
    genre: genre,
    genre_books: bookInGenre,
  });
});

// Display Genre create form on GET.
exports.genre_create_get = asyncHandler(async (req, res, next) => {
  res.render('genre_form', { title: 'Create Genre' });
});

// Handle Genre create on POST.
exports.genre_create_post = [
  body('name', 'Genre name must contain at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({ name: req.body.name })

    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'Create Genre',
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      const genreExists = await Genre.findOne({ name: req.body.name })
        .collation({ locale: 'en', strength: 2 })
        .exec()
      if (genreExists) {
        res.redirect(genreExists);
      } else {
        await genre.save();
        res.redirect(genre.url);
      }
    }
  })
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre, bookInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);
  if (genre === null) {
    const err = new Error('Genre not found');
    err.status = 404;
    return next(err);
  }

  res.render('genre_delete', {
    title: 'Genre Delete',
    genre: genre,
    genre_books: bookInGenre,
  });
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, bookInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);

  if (bookInGenre.length > 0) {
    res.render('genre_delete', {
      title: 'Genre Delete',
      genre: genre,
      genre_books: bookInGenre,
    });
    return;
  } else {
    await Genre.findByIdAndDelete(req.body.genreid);
    res.redirect('/catalog/genres');
  }
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();

  if (genre === null) {
    const err = new Error('Genre not found');
    err.status = 404;
    return next(err);
  }

  res.render('genre_form', {
    title: 'Update Genre',
    genre: genre,
  });
});

// Handle Genre update on POST.
exports.genre_update_post = [
  body('name', 'Genre name must constian at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),

    asyncHandler(async(req, res, next) => {
      const errors = validationResult(req);
      
      const genre = new Genre ({
        name: req.body.name,
        _id: req.params.id,
      });

      if  (!errors.isEmpty()) {
        res.render('genre_form', {
          title: 'Update Genre',
          genre: genre,
          errors: errors.array(),
        });
        return;
      } else {
        await Genre.findByIdAndUpdate(req.params.id, genre);
        res.redirect(genre.url);
      }
    }),
];