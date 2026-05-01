import { formatSalary } from "./utils/format";

test("formats salary ranges for job cards", () => {
  expect(formatSalary({ salaryMin: 1200000, salaryMax: 1800000 })).toBe("INR 12,00,000 - 18,00,000");
});
