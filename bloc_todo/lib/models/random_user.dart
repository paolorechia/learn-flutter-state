import 'package:equatable/equatable.dart';

class RandomResult extends Equatable {
  final List<RandomUser> results;

  const RandomResult({required this.results});

  factory RandomResult.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {'results': List results} => RandomResult(
        results: results.map((e) => RandomUser.fromJson(e)).toList(),
      ),
      _ => throw const FormatException('Failed to load random user.'),
    };
  }

  @override
  List<Object> get props => [results];
}

class RandomUser extends Equatable {
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

  @override
  List<Object> get props => [email];
}
