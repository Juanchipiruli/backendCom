# Diagrama de Entidad - Catálogo de Ropa

```mermaid
erDiagram
    MATERIA ||--o{ CATEDRA : tiene
    CATEDRA ||--o{ PROFESOR : tiene
    MATERIA ||--o{ HORARIO : tiene
    AULA ||--o{ HORARIO : tiene

    MATERIA {
      int id PK
      string nombre
      string carrera
    }

    HORARIO {
      int id PK
      int materia_id FK
      int aula_id FK
      int dia
      time hora_inicio
      time hora_fin
    }

    AULA {
      int id PK
      string nombre
      int sensor_id
    }

    PROFESOR {
      int id PK
      string nombre
      int huella_id
    }

    CATEDRA {
      int profesor_id FK
      int materia_id FK
    }