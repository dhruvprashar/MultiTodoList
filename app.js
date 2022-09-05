//jshint esversion:6

const express = require("express");
const mongoose= require('mongoose');
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://",{useNewUrlParser:true});

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const ItemSchema= new mongoose.Schema({
  name: String
});

const Item=mongoose.model('Item',ItemSchema);

const item1=new Item({
  name:"Welcome to your TODO List!!"
});
const item2=new Item({
  name:"Hit the + button to add a new Item"
});
const item3=new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems=[item1,item2,item3];

const listSchema= new mongoose.Schema({
  name:String,
  items: [ItemSchema]
});

const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {

// const day = date.getDate();
  
  Item.find({},function(err,foundItems){
    if(foundItems.length===0)
    {
      Item.insertMany(defaultItems,function(err){
        if(err)
        {
          console.log(err);
        }else{
          console.log("Successfully added Default items to DB");
        }
      });
      res.redirect('/');
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
  
});

app.get('/:customListName',function(req,res){
  const customListName= _.capitalize(req.params.customListName);
  
  

  List.findOne({name:req.params.customListName},function(err,results){
    if(err)
    {
      console.log(err);
    }
    else{
      if(results)
      {
        res.render('list',{listTitle:customListName,newListItems: results.items});
      }else{
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        // res.render('List',{
        //   listTitle: req.params.customListName,
        //   newListItems:defaultItems
        // })
        res.redirect('/'+customListName);
      }

    }
  })



})

app.post("/", function(req, res){

  // const item = req.body.newItem;

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
  const itemName= req.body.newItem;
  const listName=req.body.list;

  const NewItem= new Item({
    name:itemName
  });
  if(listName==="Today"){
    NewItem.save();
    res.redirect('/');
  }else{
    List.findOne({name:listName},function(err,foundList){
      if(!err)
      {
        foundList.items.push(NewItem);
        foundList.save();
        res.redirect('/'+listName);
      }
      else
      {
         console.log(err);
         res.redirect('/'+listName);
      }
    })
  }

 


});

app.post('/delete',function(req,res){
 
  const checkItem=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndDelete(checkItem,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Item deleted");
      }
  
    })
    res.redirect('/');
  }else{
     List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkItem}}},function(err,foundList){
      if(!err)
      {
        res.redirect('/'+listName);
      }
     })
  }


  
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});
const port=process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server started successfully");
});
