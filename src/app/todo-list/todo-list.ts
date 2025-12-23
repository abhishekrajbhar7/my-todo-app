import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ITask {
  taskName: string;
  taskStatus: string;
}

@Component({
  selector: 'app-todo-list',
  standalone: true,       // Required if using imports array
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './todo-list.html',
  styleUrls: ['./todo-list.css']
})
export class TodoList implements OnInit {
  taskList = signal<ITask[]>([]);
  filterTaskList = signal<ITask[]>([]);
  taskName: string = '';
  isFilterRecord = signal<boolean>(true);

  ngOnInit(): void {
    const localData = localStorage.getItem('taskList');
    if (localData != null) {
      const parseData = JSON.parse(localData);
      this.taskList.set(parseData);
      this.filterTaskList.set(parseData);
    }
  }

  addTask() {
    if (!this.taskName.trim()) return; // Prevent empty task

    const taskObject: ITask = {
      taskName: this.taskName,
      taskStatus: 'New'
    };

    this.taskList.update(oldList => [...oldList, taskObject]);
    this.filterTaskList.set(this.taskList());
    localStorage.setItem('taskList', JSON.stringify(this.taskList()));
    this.taskName = '';
  }

  textChange() {
    const filterData = this.taskList().filter(task =>
      task.taskName.toLowerCase().startsWith(this.taskName.toLowerCase())
    );

    if (filterData.length > 0) {
      this.isFilterRecord.set(true);
      this.filterTaskList.set(filterData);
    } else {
      this.isFilterRecord.set(false);
    }
  }
  onStatusFilter(event:any){
    const status = event.target.value;
    if (status === "All") {
       this.isFilterRecord.set(true);
      this.filterTaskList.set(this.taskList());
    }else{
      const filterData = this.taskList().filter(task =>
      task.taskStatus.startsWith(status)
    );

    if (filterData.length > 0) {
      this.isFilterRecord.set(true);
      this.filterTaskList.set(filterData);
    } else {
      this.isFilterRecord.set(false);
    }
    }
    
  }
  changeStatus(event:any, taskData:ITask){
    const status = event.target.value;
    taskData.taskStatus = status;
    this.taskList.set(this.filterTaskList());
    localStorage.setItem('taskList', JSON.stringify(this.taskList()))
  }
  
  deleteTask(taskToDelete: ITask) {
  const updatedList = this.taskList().filter(task => task !== taskToDelete);
  this.taskList.set(updatedList);
  
  // Update filtered list
  const updatedFilterList = this.filterTaskList().filter(task => task !== taskToDelete);
  this.filterTaskList.set(updatedFilterList);

  // Update localStorage
  localStorage.setItem('taskList', JSON.stringify(this.taskList()));

  // If no tasks after deletion, set isFilterRecord accordingly
  this.isFilterRecord.set(this.filterTaskList().length > 0);
}
}
