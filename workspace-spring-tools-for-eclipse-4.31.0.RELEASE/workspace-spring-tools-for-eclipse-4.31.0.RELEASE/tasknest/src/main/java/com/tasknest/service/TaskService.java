package com.tasknest.service;

import com.tasknest.entity.Task;
import java.util.List;

public interface TaskService {

    List<Task> getTasksForUser(String email);

    Task createTask(Task t);

    Task updateTask(Long id, Task task);

    void deleteTask(Long id);
}
