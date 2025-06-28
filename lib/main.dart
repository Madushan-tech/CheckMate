import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
// import 'package:material_design_icons_flutter/material_design_icons_flutter.dart'; // Will be used later
import 'package:checkmate/screens/home_screen.dart';
import 'package:checkmate/screens/plan_screen.dart';
import 'package:checkmate/screens/report_screen.dart'; // Import the new report screen
import 'package:checkmate/screens/profile_screen.dart'; // Import the new profile screen

// Placeholder screen widgets are now in their own files.


void main() {
  runApp(const CheckMateApp());
}

class CheckMateApp extends StatelessWidget {
  const CheckMateApp({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final darkTheme = ThemeData.dark();

    return MaterialApp(
      title: 'CheckMate',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF000000), // --primary-bg
        scaffoldBackgroundColor: const Color(0xFF000000), // --primary-bg

        textTheme: GoogleFonts.interTextTheme(darkTheme.textTheme).copyWith(
          bodyLarge: GoogleFonts.inter(textStyle: textTheme.bodyLarge?.copyWith(color: const Color(0xFFFFFFFF))),
          bodyMedium: GoogleFonts.inter(textStyle: textTheme.bodyMedium?.copyWith(color: const Color(0xFFFFFFFF))),
          titleMedium: GoogleFonts.inter(textStyle: textTheme.titleMedium?.copyWith(color: const Color(0xFFFFFFFF))),
          titleSmall: GoogleFonts.inter(textStyle: textTheme.titleSmall?.copyWith(color: const Color(0xFF9CA3AF))), // --text-secondary
          labelSmall: GoogleFonts.inter(textStyle: textTheme.labelSmall?.copyWith(fontSize: 10, color: const Color(0xFF9CA3AF))), // For nav item labels
        ),

        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF10B981), // --accent-green (used for active elements like selected nav item)
          secondary: Color(0xFFFDFD96), // --accent-yellow
          surface: Color(0xFF1C1C1E), // --secondary-bg (cards, navs, appbar)
          background: Color(0xFF000000), // --primary-bg
          error: Color(0xFFF44336), // --accent-red
          onPrimary: Color(0xFF000000), // Text on primary color (e.g. FAB)
          onSecondary: Color(0xFF000000), // Text on secondary color
          onSurface: Color(0xFFFFFFFF), // --text-primary (default text on cards/appbar)
          onBackground: Color(0xFFFFFFFF), // --text-primary (default text on scaffold bg)
          onError: Color(0xFFFFFFFF),
        ),

        appBarTheme: AppBarTheme(
          backgroundColor: const Color(0xFF1C1C1E), // --secondary-bg
          elevation: 0, // Flat app bar
          titleTextStyle: GoogleFonts.inter(
            color: const Color(0xFFFFFFFF), // --text-primary
            fontSize: 20, // Corresponds to app-title size
            fontWeight: FontWeight.bold,
          ),
          iconTheme: const IconThemeData(
            color: Color(0xFFFFFFFF), // --text-primary for icons in AppBar
          ),
        ),

        bottomNavigationBarTheme: BottomNavigationBarThemeData(
          backgroundColor: const Color(0xFF1C1C1E), // --secondary-bg
          selectedItemColor: const Color(0xFF10B981), // --accent-green
          unselectedItemColor: const Color(0xFF9CA3AF), // --text-secondary
          type: BottomNavigationBarType.fixed, // Ensures background color is applied
          selectedLabelStyle: GoogleFonts.inter(fontSize: 11.2, fontWeight: FontWeight.w500), // 0.7rem approx
          unselectedLabelStyle: GoogleFonts.inter(fontSize: 11.2, fontWeight: FontWeight.w500), // 0.7rem approx
          elevation: 0, // Remove shadow/border if any from default
        ),

        useMaterial3: true,
      ),
      home: const MainScaffold(),
    );
  }
}

class MainScaffold extends StatefulWidget {
  const MainScaffold({super.key});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  int _selectedIndex = 0;

  static const List<Widget> _widgetOptions = <Widget>[
    HomeScreen(),
    PlanScreen(),
    ReportScreen(),
    ProfileScreen(),
  ];

  // Titles for AppBar, can be dynamic or based on page
  static const List<String> _appBarTitles = <String>[
    '', // Home page might not have a title, or use a logo
    'Plan', // Title for Plan page - an AppBar will be shown here
    'Report', // Title for Report page - an AppBar will be shown here
    'Profile', // Title for Profile page - an AppBar will be shown here
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  PreferredSizeWidget? _buildAppBar() {
    // As per web app:
    // Home page: Has a header with logo and notification.
    // Plan, Report, Profile pages: Web app hides the main header.
    // The task countdown bar is visible and sticky at the top for these pages.

    // For Flutter, we'll provide an AppBar for Home.
    // For Plan, Report, Profile, the web app effectively had no main header.
    // The task countdown container will be part of each screen's content for now,
    // or handled by a global state solution later for true sticky behavior across all.
    // So, for Plan, Report, Profile, we can return null for AppBar to hide it,
    // or show a simple one if preferred for Flutter's typical structure.

    if (_selectedIndex == 0) { // Home page
      return AppBar(
        automaticallyImplyLeading: false,
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // TODO: Replace with actual logo if available
            Text('CheckMate', style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 20)),
            IconButton(
              icon: const Icon(Icons.notifications_none_outlined), // Using outlined version
              onPressed: () {
                // Handle notification tap
              },
            ),
          ],
        ),
        backgroundColor: Theme.of(context).colorScheme.surface,
      );
    }
    // For Plan, Report, Profile, we will not show an AppBar to more closely match
    // the web app's structure where the main header was hidden.
    // The sticky date filter in PlanScreen will be at the very top of its content.
    // The task countdown (if implemented per screen) would be at the top too.
    return null;
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(),
      body: IndexedStack(
        index: _selectedIndex,
        children: _widgetOptions,
      ),
      floatingActionButton: _selectedIndex == 1 // Show FAB only on Plan screen (index 1)
          ? FloatingActionButton(
              onPressed: () {
                // TODO: Implement openNewTaskModal logic
                // This would typically involve showing a Dialog or a ModalBottomSheet.
                print("FAB Tapped - Open New Task Modal");
              },
              backgroundColor: Theme.of(context).colorScheme.primary, // --accent-green
              child: Icon(
                Icons.add,
                color: Theme.of(context).colorScheme.onPrimary, // Should be dark if accent-green is light
              ),
              shape: const CircleBorder(),
            )
          : null,
      bottomNavigationBar: Container( // Wrap BottomNavBar to apply border radius
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(color: Theme.of(context).dividerColor, width: 0.5), // Match web border
          ),
          borderRadius: const BorderRadius.only( // Match web border radius
            topLeft: Radius.circular(16.0),
            topRight: Radius.circular(16.0),
          ),
          color: Theme.of(context).bottomNavigationBarTheme.backgroundColor, // Use theme color
        ),
        child: ClipRRect( // Clip content to the rounded border
           borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(16.0),
            topRight: Radius.circular(16.0),
          ),
          child: BottomNavigationBar(
            items: const <BottomNavigationBarItem>[
              BottomNavigationBarItem(
                icon: Icon(Icons.home_outlined), // Using outlined icons
                activeIcon: Icon(Icons.home), // Filled icon when active
                label: 'Home',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.list_alt_outlined), // Using outlined icons
                activeIcon: Icon(Icons.list_alt), // Filled icon when active
                label: 'Plan',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.bar_chart_outlined), // Using outlined icons
                activeIcon: Icon(Icons.bar_chart), // Filled icon when active
                label: 'Report',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.person_outline), // Using outlined icons
                activeIcon: Icon(Icons.person), // Filled icon when active
                label: 'Profile',
              ),
            ],
            currentIndex: _selectedIndex,
            onTap: _onItemTapped,
            // Styling is now primarily from ThemeData.bottomNavigationBarTheme
          ),
        ),
      ),
    );
  }
}
