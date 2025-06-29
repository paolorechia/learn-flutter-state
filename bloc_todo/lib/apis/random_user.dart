import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:bloc_todo/models/random_user.dart';


Future<RandomResult> fetchRandomUser() async {
  final response = await http.get(
    Uri.parse('https://randomuser.me/api/')
  );
  
  if (response.statusCode == 200) {
    return RandomResult.fromJson(
      jsonDecode(response.body) as Map<String, dynamic>
    );
  } else {
    throw Exception("Failed to load random user");
  }
}