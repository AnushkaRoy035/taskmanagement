package com.tasknest.service;

import com.tasknest.entity.Task;
import com.tasknest.repository.TaskRepository;
import com.tasknest.service.TaskService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository repo;

    public TaskServiceImpl(TaskRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<Task> getTasksForUser(String email) {
        return repo.findByUserEmail(email);
    }

    @Override
    public Task createTask(Task t) {
        return repo.save(t);
    }

    @Override
    public Task updateTask(Long id, Task updatedTask) {
        return repo.findById(id)
                .map(existing -> {
                    existing.setTitle(updatedTask.getTitle());
                    existing.setDescription(updatedTask.getDescription());
                    existing.setPriority(updatedTask.getPriority());
                    existing.setCategory(updatedTask.getCategory());
                    existing.setCompleted(updatedTask.isCompleted());
                    existing.setDueDate(updatedTask.getDueDate());
                    return repo.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    @Override
    public void deleteTask(Long id) {
        repo.deleteById(id);
    }
}
