import Employee from "../models/EmployeeModel.js";

/**
 * Repository para Employee - desacopla el motor de cálculo de MongoDB
 */
class EmployeeRepository {
  async findById(id) {
    return Employee.findById(id);
  }

  async findByCompanyId(companyId, activeOnly = true) {
    const query = { companyId };
    if (activeOnly) {
      query.isActive = true;
    }
    return Employee.find(query);
  }

  async create(data) {
    const employee = new Employee(data);
    return employee.save();
  }

  async createMany(employees) {
    return Employee.insertMany(employees);
  }

  async update(id, data) {
    return Employee.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return Employee.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  /**
   * Obtener empleados formateados para el motor de cálculo
   */
  async getForCalculation(companyId) {
    const employees = await this.findByCompanyId(companyId, true);
    return employees.map((emp) => ({
      id: emp._id.toString(),
      name: emp.name,
      amount: emp.baseSalary,
      productivityIndex: emp.productivityIndex,
    }));
  }

  /**
   * Calcular total de salarios fijos de trabajo
   */
  async getTotalLaborCosts(companyId) {
    const result = await Employee.aggregate([
      { $match: { companyId, isActive: true } },
      { $group: { _id: null, total: { $sum: "$baseSalary" } } },
    ]);
    return result[0]?.total || 0;
  }
}

export default new EmployeeRepository();
