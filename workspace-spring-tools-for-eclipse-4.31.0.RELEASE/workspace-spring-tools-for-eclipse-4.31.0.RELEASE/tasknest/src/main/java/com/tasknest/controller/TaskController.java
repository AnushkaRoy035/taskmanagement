package com.tasknest.controller;

import com.tasknest.entity.Task;
import com.tasknest.repository.TaskRepository;
import com.tasknest.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    // Get tasks for logged-in user
    @GetMapping
    public List<Task> getTasksForUser(@RequestParam String email) {
        return service.getTasksForUser(email);
    }


    // Create task
    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return service.createTask(task);
    }

    // Update task
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @RequestBody Task updatedTask) {

        return ResponseEntity.ok(service.updateTask(id, updatedTask));
    }

    // Delete task
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        service.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
