import 'package:http/http.dart' as http;
import 'dart:convert';

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


class RandomResult {
  List<RandomUser> results;

  RandomResult({required this.results});

  factory RandomResult.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {'results': List results} => RandomResult(
        results: results.map((e) => RandomUser.fromJson(e)).toList(),
      ),
      _ => throw const FormatException('Failed to load random user.'),
    };
  }
}


class RandomUser {
  final String gender;
  final String email;

  const RandomUser({required this.gender, required this.email});

  factory RandomUser.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {'gender': String gender, 'email': String email} => RandomUser(
        gender: gender,
        email: email,
      ),
      _ => throw const FormatException('Failed to load random user.'),
    };
  }
}