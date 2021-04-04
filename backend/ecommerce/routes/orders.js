var express = require('express');
var router = express.Router();
const {database}= require('../config/helpers');


/* GET ALL ORDERS. */
router.get('/', function(req, res, next) {
   database.table('orders_details as od').join([{
     table: 'orders as o',
     on:'o.id=od.order_id'
   },
   {
     table: 'products as p',
     on: 'p.id=od.product_id'
   },
   {
     table: 'users as u',
     on: 'u.id=o.user_id'
   }
  ]).withFields(['o.id','p.title as name', 'p.description', 'p.price','u.username']).sort({id:1})
  .getAll()
  .then(function(orders){
     if(orders.length>0)
     {
       res.status(200).json(orders);
     }else{
       res.json({
         message: 'No Orders found'
       })
     }
  }).catch(function(e){
    console.log(e);
  });
});


/* GET ALL ORDERS. */
router.get('/:id', (req,res)=>{

      const orderId=req.params.id;

      database.table('orders_details as od').join([{
        table: 'orders as o',
        on:'o.id=od.order_id'
      },
      {
        table: 'products as p',
        on: 'p.id=od.product_id'
      },
      {
        table: 'users as u',
        on: 'u.id=o.user_id'
      }
    ]).withFields(['o.id','p.title as name', 'p.description', 'p.price','u.username', 'p.image','od.quantity as quantityOrdered'])
    .filter({'o.id':orderId})
    .getAll()
    .then(function(orders){
        if(orders.length>0)
        {
          res.status(200).json(orders);
        }else{
          res.json({
            message: `No Orders found${orderId}`
          })
        }
    }).catch(function(e){
      console.log(e);
 });

});

/* PLACE NEW ORDER*/

router.post('/new',(req,res)=>{

   let {userId, products}=req.body;

   //check userId no null and no zero
   if(userId!=null&&userId>0&& !isNaN(userId))
   {
     database.table('orders')
            .insert({
              user_id:userId
            }).then(newOrderId=>{
                console.log("Here is the new order number",newOrderId);
              if(newOrderId>0)
              {
                 products.forEach( async (p)=>{
                   let data= await database.table('products').filter({id:p.id}).withFields(['quantity']).get();

                   let incart= p.incart;

                   //deduct the number of pieces ordered from the quantity column in database
                   if(data.quantity>0){
                     data.quantity=data.quantity-incart;

                     if(data.quantity<0)
                     {
                       data.quantity=0
                     }
                   }else{
                     data.quantity=0;

                   }
                   //INSERT ORDER DETIALS OF THE NEWLY GENERATED ORDER id
                   database.table('orders_details')
                     .insert({
                         order_id: newOrderId,
                         product_id:p.id,
                         quantity: incart
                     }).then(newId=>{
                         database.table('products')
                           .filter({id:p.id})
                           .update({
                             quantity: data.quantity
                           }).then(successNum=>{

                           }).catch(e=>{console.log(e)})
                     }).catch(err=>{
                       console.log(err);
                     })

                 });

              }else{
                res.json({message: "New order failed while adding order details",success:false});
              }
             res.json({
                 message: `Order successfully placed with order is ${newOrderId}`,
                 success: true,
                 order_id: newOrderId,
                 products: products
             })

            }).catch(e=>{
              console.log(e);
            })
   }else{
     res.json({
       message: 'New oreder failed', success: false
      })
   }


});

//FAKE PAYMENT GATEWAY CALL
router.post('/payment',(req,res)=>{
    setTimeout(function(){
      res.status(200).json({sucess:true});
    },3000)

})




module.exports = router;
