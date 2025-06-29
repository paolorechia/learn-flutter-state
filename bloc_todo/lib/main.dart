// Library imports
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';


// Repositories
import 'repositories/random_users.dart';
// Blocs
import 'blocs/counter_bloc.dart';

// Pages
import 'pages/counter_page.dart';


void main() async {

  runApp(CounterApp());
}

class CounterApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: RepositoryProvider(
          create: (_) => RandomUserRepository(),
          child: BlocProvider(
            create: (_) => CounterBloc(),
            child: CounterPage(),
          ),
      ),
    );
  }
}

