


const router = require("express").Router();
const async = require("async");
const stripe = require("stripe")("sk_test_wkcPYTXmqh2Y1Qayai7cW1Bk");

const Category = require("../models/category");
const Product = require("../models/product");
const Review = require("../models/review");
const Order = require("../models/order");
const User = require("../models/user");
const Mark = require("../models/mark");
const multer = require("multer");


const checkJWT = require("../middlewares/check-jwt");

//Function to facilitate obtaining the product information
router.get("/products", (req, res, next) => {
  const perPage = 10;
  const page = req.query.page;
  async.parallel(
    [
      function (callback) {
        Product.count({}, (err, count) => {
          var totalProducts = count;
          callback(err, totalProducts);
        });
      },
      function (callback) {
        Product.find({
            isDeleted: false
          })
          .skip(perPage * page)
          .limit(perPage)
          .populate("category")
          .populate("owner")
          .exec((err, products) => {
            if (err) return next(err);
            callback(err, products);
          });
      },
    ],
    function (err, results) {
      var totalProducts = results[0];
      var products = results[1];

      res.json({
        success: true,
        message: "Product",
        products: products,
        totalProducts: totalProducts,
        pages: Math.ceil(totalProducts / perPage),
        currentProducts: products.length,
      });
    }
  );
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public');
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, fileName);
  },
});
const upload = multer({ storage });
//fin 
router
  .route("/marks")
  .get(checkJWT, (req, res, next) => {
    console.log("pppppppppppppppppp"+req.decoded.user._id)
      .populate("category")
      .exec((err, marks) => {
        if (marks) {
          res.json({
            success: true,
            message: "Marks",
            marks: marks,
          });
        }
      });
  })
  .post([checkJWT, upload.single("mark_picture")], (req, res, next) => {
    console.log(upload);
    console.log(req.file);
    let mark = new Mark();
    mark.category = req.body.categoryId;
    mark.title = req.body.title;
    mark.image = req.protocol+'://' +req.get('host')+'/'+'marks'+req.file.filename;
    //'public'+'/'+ req.file.filename;

    mark.isDeleted = false;
    mark.save()//;
    /*res.json({
      success: true,
      message: "Successfully Added the mark",
    });*/
   /* res.catch(error => {
      console.log(error);
      res.status(400).json({ error });
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => {
        console.log(error);
        res.status(400).json({ error });*/
        .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
        .catch(error => {
          console.log(error);
          res.status(400).json({ error });
      });
  });

//Function to facilitate categories GET and POST requests
router
  .route("/categories")
  .get((req, res, next) => {
    Category.find({}, (err, categories) => {
      res.json({
        success: true,
        message: "Success",
        categories: categories,
      });
    });
  })
  .post((req, res, next) => {
    let category = new Category();
    category.name = req.body.category;
    category.save();
    res.json({
      success: true,
      message: "Successful",
    });
  });

//Function to facilitate get request of specific categories
router.get("/categories/:id", (req, res, next) => {
  const perPage = 10;
  const page = req.query.page;
  async.parallel(
    [
      function (callback) {
        Product.count({
          category: req.params.id
        }, (err, count) => {
          var totalProducts = count;
          callback(err, totalProducts);
        });
      },
      function (callback) {
        Product.find({
            category: req.params.id
          })
          .skip(perPage * page)
          .limit(perPage)
          .populate("category")
          .populate("owner")
          .populate("reviews")
          .exec((err, products) => {
            if (err) return next(err);
            callback(err, products);
          });
      },
      function (callback) {
        Category.findOne({
          _id: req.params.id
        }, (err, category) => {
          callback(err, category);
        });
      },
    ],
    function (err, results) {
      var totalProducts = results[0];
      var products = results[1];
      var category = results[2];
      res.json({
        success: true,
        message: "category",
        products: products,
        categoryName: category.name,
        totalProducts: totalProducts,
        pages: Math.ceil(totalProducts / perPage),
      });
    }
  );
});

router.post("/product/:id/qty", (req, res) => {
  Product.findByIdAndUpdate({
      _id: req.params.id
    }, {
      quantity: req.body.qty
    },
    function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});
//***
router.post("/product/:id/qty", (req, res) => {
  Product.findByIdAndUpdate({
      _id: req.params.id
    }, {
      quantity: req.body.qty
    },
    function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});
//*/

//Function to facilitate get request of specific product
router.get("/product/:id", (req, res, next) => {
  Product.findById({
      _id: req.params.id
    })
    .populate("category")
    .populate("owner")
    .deepPopulate("reviews.owner")
    .exec((err, product) => {
      if (err) {
        res.json({
          success: false,
          message: "Product is not found",
        });
      } else {
        if (product) {
          res.json({
            success: true,
            product: product,
          });
        }
      }
    });
});

//Function to facilitate review functionality
router.post("/review", checkJWT, (req, res, next) => {
  async.waterfall([
    function (callback) {
      Product.findOne({
        _id: req.body.productId
      }, (err, product) => {
        if (product) {
          callback(err, product);
        }
      });
    },
    function (product) {
      let review = new Review();
      review.owner = req.decoded.user._id;

      if (req.body.title) review.title = req.body.title;
      if (req.body.description) review.description = req.body.description;
      review.rating = req.body.rating;

      product.reviews.push(review._id);
      product.save();
      review.save();
      res.json({
        success: true,
        message: "Successfully added the review",
      });
    },
  ]);
});

//Function to facilitate payment functionality  using STRIPE API
router.post("/payment", checkJWT, (req, res, next) => {
  const currentCharges = Math.round(req.body.total);

  const products = req.body.products;
  console.log("PAYMENTGW: products", products);

  let order = new Order();
  order.owner = req.decoded.user._id;
  order.totalPrice = currentCharges;
  let i = 0;
  products.map((product) => {
    console.log("PAYMENTS_GW: Product ", product.title);
    order.products.push({
      product: product.product,
      quantity: product.quantity,
    });
    i++;
  });

  order.save();

  res.json({
    success: true,
    message: "Successfully made a payment",
  });
});
router
  .route("/users")
  .get((req, res, next) => {
    User.find({}, (err, users) => {
      res.json({
        success: true,
        message: "Success",
        users: users,
      });
    });
  })
//Exporting the module
module.exports = router;