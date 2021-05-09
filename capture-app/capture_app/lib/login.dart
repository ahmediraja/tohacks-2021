import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'main.dart';

Future<http.Response> sendLoginRequest(String email, String password) async {
    // Send the LOGIN request
  final response = await http.post(
      Uri.https('to-hacks2021.herokuapp.com', '/api/auth'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{'email': email, 'password': password}));
  // After the request is sent, we must wait for the response to validate the info and let us in
  return response;

  // Can then use
  // final resBody = jsonDecode(response.body);
  // To get the response body as a json, then access things like
  // resBody['token']
}

class LoginPage extends StatefulWidget {
  static String tag = 'login-page';
  String email, password;

  LoginPage();

  @override
  _LoginPageState createState() => new _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  TextEditingController emailController = new TextEditingController();
  TextEditingController passController = new TextEditingController();
  bool _loginFailed = false;
  String token;

  _LoginPageState();

  @override
  Widget build(BuildContext context) {

    final logo = Hero(
      tag: 'hero',
      child: CircleAvatar(
        backgroundColor: Colors.transparent,
        radius: 48.0,
        // child: Icon(Icons.camera),
        child: Image.asset('assets/camera.png'),
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

    // Error message which is only visible after failing to log in
    final errorMessage = Text("Invalid email or password!", textAlign: TextAlign.center, style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold));

    final loginButton = Padding(
      padding: EdgeInsets.symmetric(vertical: 16.0),
      child: ElevatedButton(
        onPressed: () async { // Login button pushed
          String email = emailController.text;
          String password = passController.text;

          final response = await sendLoginRequest(email, password);

          // After the request is sent, we must wait for the response to validate the info and let us in
          final resBody = jsonDecode(response.body);

          if (resBody['token'] != null){ // if a token was given, there was no error, so continue
            log(resBody['token']);
            final prefs = await SharedPreferences.getInstance();
            prefs.setString('token', resBody['token']);

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
                  camera: firstCamera,
                ),
              ),
            );
          } else {
            this.setState(() {
              _loginFailed = true;
            });
          }
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
            if(_loginFailed) errorMessage,
            loginButton,
          ],
        ),
      ),
    );
  }
}
