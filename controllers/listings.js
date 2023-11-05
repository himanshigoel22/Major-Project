const listing = require("../models/listing.js");
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index =  async(req , res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs" , { allListings }); 
  };

module.exports.renderNewForm =  async(req , res) =>{
    res.render("listings/new.ejs");
  };

module.exports.showListing = async(req , res) =>{
    let {id} = req.params;
    const Listing = await listing.findById(id)
    .populate({path: "reviews", populate: {path: "author"}})
    .populate("owner");
    if(!Listing){
      req.flash("error" , "Listing does not exist!");
      res.redirect("/listing");
    }
    res.render("listings/show.ejs" , { Listing });
    };

module.exports.createListing = async(req , res , next) =>{

       let response = await geocodingClient.forwardGeocode({
       query: req.body.listing.location ,
       limit: 1
         })
       .send();

      let url = req.file.path;
      let filename = req.file.filename;
      const newlisting = new Listing(req.body.listing);
      newlisting.owner = req.user._id;
      newlisting.image = {url,filename};

      newlisting.geometry = response.body.features[0].geometry;

      let savedlisting = await newlisting.save();
      console.log(savedlisting );
      req.flash("success" , "New Listing Created!");
      res.redirect("/listing");
    };

module.exports.renderEditForm = async(req , res) =>{
    let {id} = req.params;
    const Listing = await listing.findById(id);
    if(!Listing){
      req.flash("error" , "Listing does not exist!");
      res.redirect("/listing");
    }
    let originalUrl = Listing.image.url;
    originalUrl = originalUrl.replace("/upload" , "/upload/w_250");

    res.render("listings/edit.ejs" , { Listing ,originalUrl });
  };

module.exports.updateListing =  async(req , res) =>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file !== "undefined"){
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = {url , filename};
      await listing.save();
    }
   
    req.flash("success" , "Listing Updated!");
    res.redirect(`/listing/${id}`);
  };

module.exports.destroyListing =  async(req , res) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success" , "Listing Deleted!");
    res.redirect("/listing");
  };

module.exports.searchListing = async (req, res) => {
  const searchQuery = req.query.searchQuery;
  const listings = await Listing.find({ country: { $regex: searchQuery, $options: 'i' } });
  if (listings.length === 0){
    req.flash("error" , "Enter appropriate country name!");
    res.redirect("/listing");
  } 
  res.render("listings/search.ejs", { listings });
}