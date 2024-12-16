let express=require('express')
const app=express()
var mysql = require('mysql2');
const bodyParser = require('body-parser');
const ejs = require('ejs');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(3000,()=>{})
app.set('view engine','ejs')

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "",
});
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});
app.use(express.json());
app.get('/',(req,res)=>{
    res.sendFile("public/home.html",{root:__dirname})
})
app.get('/aboutus',(req,res)=>{
    res.sendFile('public/aboutus.html',{root:__dirname})
});
app.get('/contactus',(req,res)=>{
    res.sendFile('public/contact.html',{root:__dirname})
})

app.get('/mycustomers',(req,res)=>{
    const q1="SELECT * from customer"
    con.query(q1,(err,results)=>{
        if(err) throw err;
        res.render('mycustomers',{customers:results})
    })
})


app.get('/myorders',(req,res)=>{
    const q1="SELECT * from orders"
    con.query(q1,(err,results)=>{
        if(err) throw err;
        res.render('myorders',{orders:results})
    })
})
app.get('/myproducts',(req,res)=>{
    const q1="SELECT * from product"
    con.query(q1,(err,results)=>{
        if(err) throw err;
        res.render('myproducts',{products:results})
    })
})
app.get('/myproductdetails',(req,res)=>{
    const q1="SELECT * from product_details"
    con.query(q1,(err,results)=>{
        if(err) throw err;
        res.render('myproductdetails',{products:results})
    })
})

app.get('/mycartitems',(req,res)=>{
    const q1="SELECT * from cart_items"
    con.query(q1,(err,results)=>{
        if(err) throw err;
        res.render('mycartitems',{cartItems:results})
    })
})

app.get('/help',(req,res)=>{
    res.sendFile('public/help.html',{root:__dirname})
})
app.get('/help/orderdisplay',(req,res)=>{
    res.sendFile('public/orderdisplay.html',{root:__dirname})
})
app.post('/help/orderdisplay',async (req,res)=>{
    const oid=req.body.orderID
    var cusid=0;


    var q1=`select customer_id from ORDERS where order_id=${oid}`;
    await new Promise((resolve, reject) => {
        con.query(q1, (err, result) => {
            if (err) throw err
            if(result.length===0){
                res.send("Not found");
            }
            else{
            cusid=result[0].customer_id;
            }
            resolve();
        });
    });
    var cartItems;
    var q2=`select product_id,quantity from cart_items where order_id="${oid}"`;
    await new Promise((resolve, reject) => {
        con.query(q2, (err, result) => {
            if (err) reject(err);
            cartItems=result;
            resolve();
        });
    });
    var total=0;
    
    console.log(cartItems);

    var pname=[]
    await new Promise(async (resolve, reject) => {
        try {
            const promises = cartItems.map(async (item) => {
                const sql = `select product_name,price from product where product_id="${item.product_id}"`;
                return new Promise((resolve, reject) => {
                    con.query(sql, (err, result) => {
                        if (err) reject(err);
                        pname.push({ product_name: result[0].product_name ,price:result[0].price});
                        total =total+ parseFloat(result[0].price) * parseInt(item.quantity);
                        
                        resolve();
                    });
                });
            });
    
            await Promise.all(promises);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
   
    res.render('orderdetails', { order_id: oid, customer_id: cusid, pname, cartItems, totalPrice: total,msg:"" });
    
  // res.json({order_id:oid,customer_id:cusid,product_name:pname,quantity:qty,total_price:totalp})
 //  res.render('orderdetails',{order_id:oid,customer_id:cusid,product_name:pname,quantity:qty,total_price:totalp,msg:" "})
})


app.get('/help/orderdelete',(req,res)=>{
    res.sendFile('public/orderdelete.html',{root:__dirname})
})

app.post('/help/orderdelete',async(req,res)=>{
    const oid=req.body.orderID
    var cusid=0;


    var q1=`select customer_id from ORDERS where order_id=${oid}`;
    await new Promise((resolve, reject) => {
        con.query(q1, (err, result) => {
            if (err) reject(err);
            if(result.length===0){
                res.send("Not found");
            }
            else{
            cusid=result[0].customer_id;
            }
          
            resolve();
        });
    });
    var cartItems;
    var q2=`select product_id,quantity from cart_items where order_id="${oid}"`;
    await new Promise((resolve, reject) => {
        con.query(q2, (err, result) => {
            if (err) reject(err);
            cartItems=result;
            resolve();
        });
    });
    var total=0;
    
    console.log(cartItems);

    var pname=[]
    await new Promise(async (resolve, reject) => {
        try {
            const promises = cartItems.map(async (item) => {
                const sql = `select product_name,price from product where product_id="${item.product_id}"`;
                return new Promise((resolve, reject) => {
                    con.query(sql, (err, result) => {
                        if (err) reject(err);
                        pname.push({ product_name: result[0].product_name ,price:result[0].price});
                        total+=total+ parseFloat(result[0].price) * parseInt(item.quantity);
                        
                        resolve();
                    });
                });
            });
    
            await Promise.all(promises);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
   
    var q4=`delete from cart_items where order_id=${oid}`;
    await new Promise((resolve, reject) => {
        con.query(q4, (err, result) => {
            if (err) reject(err);
       
            resolve();
        });
    });
   
    var q5=`delete from orders where order_id=${oid}`;
    await new Promise((resolve, reject) => {
        con.query(q5, (err, result) => {
            if (err) reject(err);
       
            resolve();
        });
    });
    var q6=`delete from customer where customer_id=${cusid}`;
    await new Promise((resolve, reject) => {
        con.query(q6, (err, result) => {
            if (err) reject(err);
      
            resolve();
        });
    });
    await new Promise((resolve, reject) => {
        cartItems.forEach(item => {
        const sql = `update product set totalQty=totalqty+${item.quantity} where product_id="${item.product_id}"`;
        con.query(sql, (err, result) => {
            if (err) reject(err);
            resolve();
        });
    });
    });
    res.render('orderdetails', { order_id: oid, customer_id: cusid, pname, cartItems, totalPrice: total,msg:"Order Deleted" });
    
})


app.get('/product',(req,res)=>{
    res.sendFile("public/products_temp.html",{root:__dirname})
})
app.use(express.json());
var cartItems;
app.post('/product', (req, res) => {
    cartItems = req.body.cartItems;
    //console.log(cartItems)
    // Insert each cart item into the database
    //res.redirect('/booknow')
});




app.get('/booknow',(req,res)=>{ 
    //console.log('BOOKing')
   
        res.sendFile('public/placeorder.html',{root:__dirname})
  
});


app.post('/booknow',async(req,res)=>{
    try{

        const fname=req.body.firstName;
        const lname=req.body.lastName;
        const emailid=req.body.email;
        const pno=req.body.phoneNumber;
  


    const q1=`Insert into customer(first_name,last_name,phoneno,email) values ("${fname}","${lname}","${pno}","${emailid}")`

    var q2=`select customer_id from customer order by customer_id desc limit 1`;
   
    
    await new Promise((resolve, reject) => {
        con.query(q1, (err, result) => {
            if (err) reject(err);
            resolve();
        });
    });
    const rows = await new Promise((resolve, reject) => {
        con.query(q2, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
    const cusid = rows[0].customer_id;
    var price;
    var q3=`insert into orders (customer_id) values (${cusid})`;
    
    await new Promise((resolve, reject) => {
        con.query(q3, (err, result) => {
            if (err) reject(err);
            resolve();
        });
    });
    var q4=`select order_id from orders order by customer_id desc limit 1`;
    var oid=0;
    await new Promise((resolve, reject) => {
        con.query(q4, (err, result) => {
            if (err) reject(err);
            oid=result[0].order_id
            resolve();
        });
    });
   
    var total=0;
    await new Promise((resolve, reject) => {
        cartItems.forEach(item => {
        const sql = `INSERT INTO cart_items (order_id,product_id,quantity) VALUES (${oid},"${item.product_id}",${item.quantity})`;
        total=total+(parseFloat(item.price)*parseInt(item.quantity))
        con.query(sql, (err, result) => {
            if (err) reject(err);
            resolve();
        });
    });
    });

    
    await new Promise((resolve, reject) => {
        cartItems.forEach(item => {
        const sql = `update product set totalQty=totalqty-${item.quantity} where product_id="${item.product_id}"`;
        con.query(sql, (err, result) => {
            if (err) reject(err);
            resolve();
        });
    });
    });
   

    // res.json([{order_id:oid,customer_name:`${fname} ${lname}`,phoneNumber:pno,email:emailid },cartItems,{totalprice:total}])
    res.render('totalbill',{order_id:oid,customer_name:`${fname} ${lname}`,phoneNumber:pno,email:emailid ,cartItems,totalPrice:total.toFixed(2)})


}catch(err){
    console.log(err);
    res.status(500).send("Internal Server Error");
}


});


app.get('/product/:productId', (req, res) => {
    const productId = req.params.productId;
    const query = `SELECT * FROM product_details WHERE product_id = "${productId}"`;
    const query2=`SELECT price FROM product WHERE product_id = "${productId}"`;
    var pri=0;
    con.query(query2,(err,results)=>{
        if(err){
            console.error('Error');
            return;
        }
        pri=results[0].price;
    })
    con.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Error fetching product details:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('Product not found');
            return;
        }

        let fn=results[0].name
        let des=results[0].Description
        let caring=results[0].CaringTips
        let weat=results[0].AdequateWeather
        let imglink=results[0].imglink
        res.render('productDetails',{fname:`${fn}`,pid:req.params.productId,fdesc:`${des}`,fimage:imglink,fcare:caring,fweather:weat,fprice:pri})
        // res.send(results)
    });
});

