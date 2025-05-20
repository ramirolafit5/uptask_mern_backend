import request from 'supertest';
import app from '../../server';
import mongoose, { Types } from 'mongoose'; // Importa mongoose
import User from '../../models/User';
import * as jwtUtils from '../../utils/jwt';

describe('POST /api/projects/', () => {
  let token: string;
  let userId: Types.ObjectId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testdb');

    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
    });
    await user.save();
    userId = user._id as Types.ObjectId; // Correct way to get the ObjectId

    token = jwtUtils.generateJWT({ id: userId });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('Debería crear un nuevo proyecto con los campos proporcionados y un usuario autenticado', async () => {
    const nuevoProyecto = {
      projectName: 'Proyecto con Correo 2',
      clientName: 'Google',
      description: 'FullStack APP',
    };

    const response = await request(app)
      .post('/api/projects/')
      .set('Authorization', `Bearer ${token}`)
      .send(nuevoProyecto);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('projectName', nuevoProyecto.projectName);
    expect(response.body).toHaveProperty('clientName', nuevoProyecto.clientName);
    expect(response.body).toHaveProperty('description', nuevoProyecto.description);
    expect(response.body).toHaveProperty('userId', userId.toString());
  });

  it('Debería devolver un error 400 si el campo projectName está vacío', async () => {
    const proyectoConNombreVacio = {
      projectName: '',
      clientName: 'Google',
      description: 'FullStack APP',
    };

    const response = await request(app)
      .post('/api/projects/')
      .set('Authorization', `Bearer ${token}`) // Agrega el token al header
      .send(proyectoConNombreVacio);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('El campo projectName es obligatorio');
  });

  it('Debería devolver un error 400 si el campo clientName está vacío', async () => {
    const proyectoConClienteVacio = {
      projectName: 'Proyecto con Correo 2',
      clientName: '',
      description: 'FullStack APP',
    };

    const response = await request(app)
      .post('/api/projects/')
      .set('Authorization', `Bearer ${token}`) // Agrega el token
      .send(proyectoConClienteVacio);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('El campo clientName es obligatorio');
  });

  it('Debería devolver un error 400 si el campo description está vacío', async () => {
    const proyectoConDescripcionVacia = {
      projectName: 'Proyecto con Correo 2',
      clientName: 'Google',
      description: '',
    };

    const response = await request(app)
      .post('/api/projects/')
      .set('Authorization', `Bearer ${token}`) // Agrega el token
      .send(proyectoConDescripcionVacia);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('El campo description es obligatorio');
  });

  // Agrega un test para el caso en que no se proporciona un token de autenticación
  it('Debería devolver un error 401 si no se proporciona un token de autenticación', async () => {
    const nuevoProyecto = {
      projectName: 'Proyecto sin Token',
      clientName: 'Cliente',
      description: 'Descripción',
    };

    const response = await request(app)
      .post('/api/projects/')
      .send(nuevoProyecto);

    expect(response.status).toBe(401); // Código de estado para "No autorizado"
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('No autorizado'); // O el mensaje de error que uses
  });
});

