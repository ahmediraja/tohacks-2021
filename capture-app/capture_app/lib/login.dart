import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'main.dart';

class LoginPage extends StatefulWidget {
  static String tag = 'login-page';
  @override
  _LoginPageState createState() => new _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  TextEditingController emailController = new TextEditingController();
  TextEditingController passController = new TextEditingController();

  @override
  Widget build(BuildContext context) {
    final logo = Hero(
      tag: 'hero',
      child: CircleAvatar(
        backgroundColor: Colors.transparent,
        radius: 48.0,
        child: Icon(Icons.camera),
        // child: Image.asset('assets/logo.png'),
      ),
    );

    final email = TextFormField(
      controller: emailController,
      keyboardType: TextInputType.emailAddress,
      autofocus: false,
      // initialValue: '',
      decoration: InputDecoration(
        hintText: 'Email',
        contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(32.0)),
      ),
    );

    final password = TextFormField(
      controller: passController,
      autofocus: false,
      // initialValue: '',
      obscureText: true,
      decoration: InputDecoration(
        hintText: 'Password',
        contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(32.0)),
      ),
    );

    final loginButton = Padding(
      padding: EdgeInsets.symmetric(vertical: 16.0),
      child: ElevatedButton(
        onPressed: () async {
          String email = emailController.text;
          String password = passController.text;

          // Send the LOGIN request
          final response = await http.post(
              Uri.https('to-hacks2021.herokuapp.com', '/api/auth'),
              headers: <String, String>{
                'Content-Type': 'application/json; charset=UTF-8',
              },
              body: jsonEncode(
                  <String, String>{'email': email, 'password': password}));
          // After the request is sent, we must wait for the response to validate the info and let us in

          log(response.body);

          final prefs = await SharedPreferences.getInstance();
          // final token = response.body.substring(10);
          final len = response.body.length;
          log(response.body.substring(10, len - 2));
          prefs.setString('token', response.body.substring(10, len - 2));

          // Obtain a list of the available cameras on the device.
          final cameras = await availableCameras();

          // Get a specific camera from the list of available cameras.
          final firstCamera = cameras.first;

          // Navigator.of(context).pushNamed(HomePage.tag);
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => TakePictureScreen(
                // Pass the automatically generated path to
                // the DisplayPictureScreen widget.
                email: email,
                password: password,
                camera: firstCamera,
              ),
            ),
          );
        },
        style: ElevatedButton.styleFrom(
          onPrimary: Colors.black,
          primary: Colors.white70,
          minimumSize: Size(88, 36),
          padding: EdgeInsets.symmetric(horizontal: 16),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(20)),
          ),
        ),
        child: Text('Log In', style: TextStyle(color: Colors.black)),
      ),
    );

    return Scaffold(
      backgroundColor: Colors.blue,
      body: Center(
        child: ListView(
          shrinkWrap: true,
          padding: EdgeInsets.only(left: 24.0, right: 24.0),
          children: <Widget>[
            logo,
            SizedBox(height: 48.0),
            email,
            SizedBox(height: 8.0),
            password,
            SizedBox(height: 24.0),
            loginButton,
          ],
        ),
      ),
    );
  }
}
