const bcrypt =
  require('bcryptjs');

const jwt =
  require('jsonwebtoken');

const prisma =
  require('../utils/prisma');

const config =
  require('../config');

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    config.JWT_SECRET,
    {
      expiresIn:
        config.JWT_EXPIRES_IN,
    }
  );
};

const normalizeEmail = (email) =>
  email
    .trim()
    .toLowerCase();

const normalizePhone = (phone) => {
  if (
    typeof phone !== 'string'
  ) {
    return null;
  }

  const clean =
    phone.trim();

  return clean || null;
};

exports.register =
  async (req, res, next) => {
    try {
      const {
        name,
        email,
        phone,
        password,
      } = req.body;

      const normalizedEmail =
        normalizeEmail(email);

      const normalizedPhone =
        normalizePhone(phone);

      const normalizedName =
        typeof name === 'string'
          ? name.trim() || null
          : null;

      const identityChecks = [
        {
          email:
            normalizedEmail,
        },
      ];

      if (normalizedPhone) {
        identityChecks.push({
          phone:
            normalizedPhone,
        });
      }

      const existingUser =
        await prisma.user.findFirst(
          {
            where: {
              OR:
                identityChecks,
            },
          }
        );

      if (existingUser) {
        if (
          existingUser.email ===
          normalizedEmail
        ) {
          return res
            .status(409)
            .json({
              message:
                'Email already registered',
            });
        }

        if (
          normalizedPhone &&
          existingUser.phone ===
            normalizedPhone
        ) {
          return res
            .status(409)
            .json({
              message:
                'Phone number already registered',
            });
        }
      }

      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );

      const user =
        await prisma.user.create(
          {
            data: {
              email:
                normalizedEmail,

              phone:
                normalizedPhone,

              name:
                normalizedName,

              passwordHash,
            },

            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              createdAt: true,
            },
          }
        );

      const token =
        generateToken(user);

      res.status(201).json({
        token,
        user,
      });
    } catch (error) {
      next(error);
    }
  };

exports.login =
  async (req, res, next) => {
    try {
      const {
        email,
        password,
      } = req.body;

      const normalizedEmail =
        normalizeEmail(email);

      const user =
        await prisma.user.findUnique(
          {
            where: {
              email:
                normalizedEmail,
            },
          }
        );

      if (!user) {
        return res
          .status(401)
          .json({
            message:
              'Invalid credentials',
          });
      }

      if (
        user.role === 'ADMIN'
      ) {
        return res
          .status(401)
          .json({
            message:
              'Use /admin/login for admin access',
          });
      }

      const isValid =
        await bcrypt.compare(
          password,
          user.passwordHash
        );

      if (!isValid) {
        return res
          .status(401)
          .json({
            message:
              'Invalid credentials',
          });
      }

      const token =
        generateToken(user);

      const {
        passwordHash,
        ...userWithoutPassword
      } = user;

      res.json({
        token,
        user:
          userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  };

exports.me =
  async (req, res, next) => {
    try {
      const user =
        await prisma.user.findUnique(
          {
            where: {
              id: req.user.id,
            },

            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              createdAt: true,
            },
          }
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              'User not found',
          });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  };

exports.adminLogin =
  async (req, res, next) => {
    try {
      const {
        email,
        password,
      } = req.body;

      const normalizedEmail =
        normalizeEmail(email);

      const admin =
        await prisma.user.findUnique(
          {
            where: {
              email:
                normalizedEmail,
            },
          }
        );

      if (
        !admin ||
        admin.role !== 'ADMIN'
      ) {
        return res
          .status(401)
          .json({
            message:
              'Invalid admin credentials',
          });
      }

      const isValid =
        await bcrypt.compare(
          password,
          admin.passwordHash
        );

      if (!isValid) {
        return res
          .status(401)
          .json({
            message:
              'Invalid admin credentials',
          });
      }

      const token =
        generateToken(admin);

      const {
        passwordHash,
        ...adminWithoutPassword
      } = admin;

      res.json({
        token,
        admin:
          adminWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  };

exports.adminMe =
  async (req, res, next) => {
    try {
      const admin =
        await prisma.user.findUnique(
          {
            where: {
              id:
                req.admin.id,
            },

            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          }
        );

      if (
        !admin ||
        admin.role !== 'ADMIN'
      ) {
        return res
          .status(404)
          .json({
            message:
              'Admin not found',
          });
      }

      res.json(admin);
    } catch (error) {
      next(error);
    }
  };