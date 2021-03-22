export interface ITask {
  title: string;
  task: Function;
  skip?: Function;
  exitOnError: boolean;
};