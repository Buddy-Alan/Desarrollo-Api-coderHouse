import twilio from "twilio";

const actId = "AC87a8fa91a7076c78dae1be8fd91fcb72"
const authTk = "e393683db9a8485affb004d36e3a617f"

export const twClient = twilio(actId, authTk)