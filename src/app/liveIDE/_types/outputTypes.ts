export interface OutputDetails {
  status?: {
    id: number;
    description: string;
  };
  compile_output?: string;
  stdout?: string;
  stderr?: string;
  time?: string;
  memory?: string;
}
