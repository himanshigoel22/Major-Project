const listing = require("../models/listing.js");
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const nodemailer = require('nodemailer');

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

  module.exports.renderEnquiryForm =  async(req , res) =>{
    res.render("listings/enquire.ejs");
  };

  module.exports.enquireListing = async (req, res) => {
    try {
      const { id } = req.params;
      const { senderName, senderEmail, message } = req.body;
  
      const listing = await Listing.findById(id).populate('owner');
      if (!listing) {
        req.flash('error', 'Listing does not exist!');
        return res.redirect('/listing');
      }
  
      const ownerEmail = listing.owner.email;
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'your-email@gmail.com',
          pass: 'your-email-password',
        },
      });
  
      const mailOptions = {
        from: senderEmail,
        to: ownerEmail,
        subject: 'New Inquiry for Your Listing',
        text: `Hello,\n\n${senderName} has sent an inquiry for your listing. Message: ${message}`,
      };
  
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          req.flash('error', 'Internal Server Error! Unable to send email.');
          res.redirect('/listing');
        } else {
          console.log('Email sent: ' + info.response);
          req.flash('success', 'Email sent successfully. Listing owner will contact you shortly!');
          res.redirect('/listing');
        }
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Internal Server Error!');
      res.redirect('/listing');
    }
  };

module.exports.searchListing = async (req, res) => {
  const searchQuery = req.query.searchQuery;
  const listings = await Listing.find({ country: { $regex: searchQuery, $options: 'i' } });
  if (listings.length === 0){
    req.flash("error" , "Enter appropriate country name!");
    res.redirect("/listing");
  } 
  res.render("listings/search.ejs", { listings });
};
