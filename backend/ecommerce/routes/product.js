const express = require('express');
const router = express.Router();
const {database}=require('../config/helpers');


/* GET All products */
router.get('/', function(req, res) {
  let page=(req.query.page!=undefined && req.query!=0)? req.query.page :1; //set current page number

  const limit= (req.query.limit!==undefined && req.query.limit!=0 )? req.query.limit: 10; //set limit of items per page

  let startvalue;
  let endvalue;

  if(page>0)
  {
    startvalue=(page*limit)-limit; //0,10,20
    endvalue= (page*limit);
  }else{
    startvalue=0;
    endvalue=10;
  }

  database.table('products as p').join([{
     table:'categories as c',
     on: 'c.id=p.cat_id'
  }]).withFields([
    'c.title as category','p.title as name', 'p.price','p.quantity','p.image','p.id','p.description'
  ]).slice(startvalue,endvalue).sort({id:-1}).getAll().then(prods=>{
    if(prods.length>0)
    {
      res.status(200).json({
        counts: prods.length,
        products: prods
      })
    }else{

      res.json({
        message: "No Products found",
        numbers:prods
      })
    }
  }).catch(err=>{
    console.log(err);
  });

});

//GET SINGLE PRODUCT
router.get('/:prodId',(req,res)=>{

  let productId= req.params.prodId;

  console.log(productId);

  database.table('products as p').join([{
    table:'categories as c',
    on: 'c.id=p.cat_id'
 }]).withFields([
   'c.title as category','p.description','p.title as name', 'p.price','p.quantity','p.image','p.images','p.id'
 ]).filter({
     'p.Id':productId
 }).get().then(prod=>{
   if(prod)
   {
     res.status(200).json(prod);
   }else{

     res.json({
       message: "No Products found with product ID",
       productID: productId

     })
   }
 }).catch(err=>{
   console.log(err);
 });


});

/* GET ALL PRODUCTS FROM ONE CATEGORY */

router.get('/category/:catName',(req,res)=>{

        let page=(req.query.page!=undefined && req.query!=0)? req.query.page :1; //set current page number

        const limit= (req.query.limit!==undefined && req.query.limit!=0 )? req.query.limit: 10; //set limit of items per page

        let startvalue;
        let endvalue;

        if(page>0)
        {
          startvalue=(page*limit)-limit; //0,10,20
          endvalue= (page*limit);
        }else{
          startvalue=0;
          endvalue=10;
        }

     //fetch category name from url
       const cat_title= req.params.catName;

        database.table('products as p').join([{
          table:'categories as c',
          on: `c.id=p.cat_id WHERE c.title LIKE '%${cat_title}%'`
        }]).withFields([
          'c.title as category','p.title as name', 'p.price','p.quantity','p.image','p.id'
        ]).slice(startvalue,endvalue).sort({id:-1}).getAll().then(prods=>{
          if(prods.length>0)
          {
            res.status(200).json({
              counts: prods.length,
              products: prods
            })
          }else{

            res.json({
              message: "No Products found from category"

            })
          }
        }).catch(err=>{
          console.log(err);
        });



});

module.exports = router;
