import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:checkmate/screens/home_screen.dart'; // For Task and TaskStep models (ideally move models to own file)

class PlanScreen extends StatefulWidget {
  const PlanScreen({super.key});

  @override
  State<PlanScreen> createState() => _PlanScreenState();
}

class _PlanScreenState extends State<PlanScreen> {
  String _selectedDateFilter = 'Today'; // Default filter

  // Dummy data - this would come from a service or state management
  final Map<String, List<Task>> _tasksByDate = {
    'Today': [
      Task(id: 'todayTask1', title: 'Morning Jog & Stretch', time: '6:30 AM - 7:00 AM', project: 'Health', categoryIconName: 'fitness_center', type: 'single-step'),
      Task(id: 'todayTask2', title: 'Review Email & Plan Day', time: '7:00 AM - 7:30 AM', project: 'Work', categoryIconName: 'email', type: 'single-step'),
      Task(id: 'todayTask4', title: 'Deep Work Session 1: Project Alpha', time: '8:30 AM - 10:30 AM', project: 'Work', categoryIconName: 'laptop_mac', type: 'multi-step', progress: 0.25, steps: [TaskStep(id: 's1', title: 'Outline', completed: true), TaskStep(id: 's2', title: 'Draft', completed: false)])
    ],
    'Tomorrow': [
      Task(id: 'tomorrowTask1', title: 'Wake Up & Morning Routine', time: '6:00 AM - 6:30 AM', project: 'Personal', categoryIconName: 'alarm', type: 'single-step'),
      Task(id: 'tomorrowTask2', title: 'Learning: Advanced JavaScript', time: '8:00 AM - 9:30 AM', project: 'Learning', categoryIconName: 'school', type: 'multi-step', progress: 0.5, steps: [TaskStep(id: 'ts1', title: 'Module 1', completed:true), TaskStep(id: 'ts2', title: 'Module 2', completed:false) ]),
    ],
    'Yesterday': [],
    '6/29/25': [],
    '6/30/25': [],
    'Note': [ // Cancelled tasks
       Task(id: 'cancelledTask1', title: 'Grocery Shopping (Cancelled)', time: '2:00 PM - 3:00 PM', project: 'Home', categoryIconName: 'shopping_cart', type: 'single-step'),
    ]
  };

  List<Task> get _filteredTasks => _tasksByDate[_selectedDateFilter] ?? [];

  final List<String> _dateFilters = ['Tomorrow', 'Today', 'Yesterday', '6/29/25', '6/30/25', 'Note'];

  Widget _buildDateFilterButton(String label) {
    final bool isActive = _selectedDateFilter == label;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4.0),
      child: ElevatedButton(
        onPressed: () {
          setState(() {
            _selectedDateFilter = label;
          });
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: isActive ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.surface,
          foregroundColor: isActive ? Theme.of(context).colorScheme.onPrimary : Theme.of(context).colorScheme.onSurface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20.0),
            side: BorderSide(color: isActive ? Colors.transparent : Theme.of(context).dividerColor),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          elevation: 0,
        ),
        child: Text(label, style: GoogleFonts.inter(fontSize: 12.25, fontWeight: FontWeight.w500)), // 0.875rem
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      children: [
        // Sticky Date Filter
        Container(
          color: Theme.of(context).scaffoldBackgroundColor, // Match page background
          padding: const EdgeInsets.symmetric(vertical: 8.0),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12.0),
            child: Row(
              children: _dateFilters.map((label) => _buildDateFilterButton(label)).toList(),
            ),
          ),
        ),
        // Tasks List
        Expanded(
          child: _filteredTasks.isEmpty
              ? Center(
                  child: Text(
                    'No tasks for $_selectedDateFilter.',
                    style: textTheme.bodyMedium,
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16.0),
                  itemCount: _filteredTasks.length,
                  itemBuilder: (context, index) {
                    return _buildTaskCard(context, _filteredTasks[index], textTheme, colorScheme);
                  },
                ),
        ),
      ],
    );
  }

  // Re-using _buildTaskCard from HomeScreen - ideally this would be a shared widget
  // For now, copying it here. In a real app, create a common widget.
  Widget _buildTaskCard(BuildContext context, Task task, TextTheme textTheme, ColorScheme colorScheme) {
    IconData _getIconData(String? iconName) {
        switch (iconName) {
            case 'skip_next': return Icons.skip_next;
            case 'code': return Icons.code;
            case 'play_circle_filled': return Icons.play_circle_filled;
            case 'videocam': return Icons.videocam;
            case 'fitness_center': return Icons.fitness_center;
            case 'email': return Icons.email;
            case 'laptop_mac': return Icons.laptop_mac;
            case 'alarm': return Icons.alarm;
            case 'school': return Icons.school;
            case 'shopping_cart': return Icons.shopping_cart;
            default: return Icons.task_alt;
        }
    }

    bool isCancelled = _selectedDateFilter == 'Note'; // Simple check for cancelled style

    return Card(
      color: colorScheme.surface,
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12.0),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    task.title,
                    style: textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                        decoration: isCancelled ? TextDecoration.lineThrough : TextDecoration.none,
                        color: isCancelled ? textTheme.titleSmall?.color : textTheme.titleMedium?.color,
                    ),
                  ),
                ),
                if (task.categoryIconName != null)
                  Icon(_getIconData(task.categoryIconName), color: isCancelled ? textTheme.titleSmall?.color : (task.categoryIconColor ?? colorScheme.primary), size: 24),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(task.time, style: textTheme.titleSmall?.copyWith(fontSize: 12.25, color: isCancelled ? textTheme.titleSmall?.color : null)),
                Text(task.project, style: textTheme.titleSmall?.copyWith(fontSize: 12.25, color: isCancelled ? textTheme.titleSmall?.color : null)),
              ],
            ),
            if (task.type == 'multi-step' && task.steps != null && !isCancelled) ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: LinearProgressIndicator(
                      value: task.progress ?? 0,
                      backgroundColor: colorScheme.onSurface.withOpacity(0.1),
                      valueColor: AlwaysStoppedAnimation<Color>(colorScheme.primary),
                      minHeight: 8,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${task.steps!.where((s) => s.completed).length}/${task.steps!.length}',
                    style: textTheme.titleSmall?.copyWith(fontSize: 11.2),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              TextButton(
                style: TextButton.styleFrom(padding: EdgeInsets.zero, alignment: Alignment.centerLeft,),
                onPressed: () { /* Handle view steps */ },
                child: Text(
                  'View Steps',
                  style: textTheme.titleSmall?.copyWith(color: colorScheme.secondary, fontSize: 11.2),
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }
}
