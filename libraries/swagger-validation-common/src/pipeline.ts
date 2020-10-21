const sendPipelineVariable = (variable: string, value: string) => {
  console.log(`##vso[task.setVariable variable=${variable}]${value}`);
};
export const sendSuccess = () => {
  sendPipelineVariable("ValidationResult", "success");
};

export const sendFailure = () => {
  sendPipelineVariable("ValidationResult", "failure");
};

export const sendLabels = (labels: string[]) => {
  if (labels.length > 0) {
    sendPipelineVariable("LABELS", labels.join(","));
  }
};
