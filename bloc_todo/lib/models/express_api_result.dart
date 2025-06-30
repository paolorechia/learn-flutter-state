import 'dart:convert';

import 'package:equatable/equatable.dart';


class ExpressApiResult extends Equatable {
    final String message;
    final bool success;
    final Map<String, dynamic>? data;

    const ExpressApiResult({
      required this.message,
      required this.success,
      this.data,
    });

    factory ExpressApiResult.fromJson(Map<String, dynamic> json) {
      return switch(json) {
        {
          'message': String message,
          'success': bool success,
          'data': Map<String, dynamic>? data,
        } => ExpressApiResult(
          message: message,
          success: success,
          data: data,
        ),
        _ => throw const FormatException('Failed to parse ExpressApiResult'),
      };
    }

    @override
    List<Object> get props => [success, message];
}
