export type ModelMeta = {
  id: string;
  name: string;
  description: string;
};

export const models: ModelMeta[] = [
  {
    id: "echo",
    name: "Echo Model",
    description: "Returns whatever you type.",
  },
  {
    id: "reverse",
    name: "Reverse Model",
    description: "Reverses your input.",
  },
  {
    id: "repeat",
    name: "Repeat Model",
    description: "Repeats your message a number of times.",
  },
]; 