import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:bloc_todo/models/express_api_result.dart';

class ExpressApi {
  final String _baseUrl = 'http://localhost:3000/api';

  Future<ExpressApiResult> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/login'),
      body: jsonEncode({'username': username, 'password': password}),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200 || response.statusCode == 401) {
      return ExpressApiResult.fromJson(
        jsonDecode(response.body) as Map<String, dynamic>,
      );
    } else {
      throw Exception("Failed to login: ${response.statusCode}");
    }
  }
}
