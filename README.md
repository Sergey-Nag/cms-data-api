1. Single Responsibility Principle (SRP):
Separate classes for database access, permission validation, and data manipulation.

2. Open/Closed Principle (OCP):
Base classes as interfaces to define common behavior, and create derived classes for specific actions.

3. Liskov Substitution Principle (LSP):
Derived classes should be substitutable for their base classes. This means that you should be able to use instances of derived classes wherever you use instances of the base class.

4. Interface Segregation Principle (ISP):
Clients should not be forced to depend on interfaces they do not use. Keep interfaces focused and avoid bloating them with methods that are irrelevant to certain implementations.

5. Dependency Inversion Principle (DIP):
High-level modules should not depend on low-level modules. Both should depend on abstractions. Use dependency injection to invert the control of dependencies.