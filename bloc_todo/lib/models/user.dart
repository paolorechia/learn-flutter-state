import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String username;
  final String email;
  final String createdAt;

  const User({
    required this.id,
    required this.username,
    required this.email,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        '_id': String id,
        'username': String username,
        'email': String email,
        'createdAt': String createdAt,
      } =>
        User(id: id, username: username, email: email, createdAt: createdAt),
      _ => throw const FormatException('Failed to parse User'),
    };
  }

  @override
  List<Object> get props => [id, username, email, createdAt];
}
