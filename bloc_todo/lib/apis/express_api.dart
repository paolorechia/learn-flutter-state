import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:bloc_todo/models/express_api_result.dart';
import 'package:logger/logger.dart';

var logger = Logger();

class ExpressApi {
  final String _baseUrl = 'http://localhost:3000/api';

  Future<ExpressApiResult> login(String username, String password) async {
    logger.i("Logger is working!");
    logger.i("Sending request: $_baseUrl/auth/login");

    final response = await http.post(
      Uri.parse('$_baseUrl/auth/login'),
      body: jsonEncode({'username': username, 'password': password}),
      headers: {'Content-Type': 'application/json'},
    );

    logger.i("Response: ${response.statusCode}");
    if (response.statusCode == 200 || response.statusCode == 401) {
      return ExpressApiResult.fromJson(
        jsonDecode(response.body) as Map<String, dynamic>,
      );
    } else {
      var errMsg = "Failed to login: ${response.request.toString()}";
      logger.e(errMsg);
      throw Exception(errMsg);
    }
  }
}
