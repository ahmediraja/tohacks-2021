const express = require("express");

const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const User = require('../models/User')


module.exports =  function(req, res, next) {
  // Verify token
  try {
    const token = req.header('x-auth-token')

    // Check if not token
    if (!token) {
      return res.status(401).json({ msg: 'You need a token!' });
    }
  
    jwt.verify(token, keys.secretOrKey, async (error, decoded) => {
      if (error) {
          console.log(error);
        res.status(401).json({ msg: 'Invalid Token!' });
      } else {
        let user = await User.findOne({ _id: decoded.user.id });
        if(!user) return res.status(401).json({ msg: 'Invalid User!' });
        req.user = decoded.user;
        next();
      }
    });
  } catch (err) {
    console.error('something wrong with auth middleware');
    res.status(500).json({ msg: 'Server Error' });
  }
};