# MomentSnap

This is for TOHacks 2021

## Inspiration
Many students have become complacent during online lectures; they don't take notes as thoroughly because they can simply take a screenshot of the lecture and paste it instead. Since many students will be returning to schools in person this year, we created _MomentSnap_ to ease this transition. 

## What it does
Log in on your phone and laptop to use MomentSnap. Take a picture of a lecture slide, note, or anything else from the phone app. The image taken will instantly be available to download or copy to clipboard on any other logged in devices! At the click of a button, instantaneously send images across devices!

## How we built it
The mobile application was created with flutter and the web application was built with react. Both of these applications communicate with a node server api which is hosted on heroku, which is also responsible for serving the web client. The server encrypts user information and stores it in a mongo database. Additionally, the server uses Google Cloud Platform's Vision API to transcribe any text recognized in the image. 

## Challenges we ran into
The feasibility of the image upload was a concern for us in the beginning: how would we get the image from the phone onto the computer quickly and efficiently? The solution we came up with was to convert the raw image data to base64, and then send that long string to the server via HTTP POST. Then it can be distributed to all connected clients and then converted back to an image to be rendered.

## Accomplishments that we're proud of
The main thing that we are proud of coming out of this project was our ability to create a multi-platform full-stack experience, complete with user accounts, token verification, server api, and two client applications. Our teamwork and collaboration was pertinent to this accomplishment.

## What we learned
We learned about how base64 works, EXIF data and that copying an image loses it. We also learned about computer vision and text recognition in images.

## What's next for MomentSnap
In our opinion, MomentSnap has potential to become a fully fleshed out service. It is yet to be known if it's actually viable in a real lecture or classroom setting, but it looks promising.
