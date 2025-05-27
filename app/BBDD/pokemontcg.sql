-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-05-2025 a las 01:25:45
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `pokemontcg`

CREATE DATABASE IF NOT EXISTS `pokemontcg` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `pokemontcg`;
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `collection`
--

CREATE TABLE `collection` (
  `id_card` varchar(255) NOT NULL,
  `name_card` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `collection`
--

INSERT INTO `collection` (`id_card`, `name_card`) VALUES
('ex1-1', 'Aggron'),
('ex1-2', 'Beautifly'),
('ex6-73', 'Pidgey'),
('ex7-4', 'Dark Electrode'),
('sv5-178', 'Metagross'),
('sv5-179', 'Meltan'),
('sv9-190', 'Spiky Energy');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`id`, `name`, `password`) VALUES
(7, 'Yo1', '$2y$10$20Pa3EhZ8HEulyvGQVaUt.CbqAYD27BWk1SE6t4Y9AL32ludT0MXa'),
(9, 'Yo3', '$2y$10$tDt.mLvTgy2rIDsC5rElfOiWjK6Z1bDZhZu9JNosORMPcHKSyrzYy'),
(10, 'Yo2', '$2y$10$kNXgUJjANAo8fevqS7OccOJWOKgfiKRb2NsN7EkXI/fOHvl9kBt56'),
(11, 'LunaO', '$2y$10$cr16gbY8nQBZGDt9ycNOg.0VWVU/4BY63H61br6fQTF7wpBebe/Ha');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_collection`
--

CREATE TABLE `user_collection` (
  `id_user` int(11) NOT NULL,
  `id_card` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user_collection`
--

INSERT INTO `user_collection` (`id_user`, `id_card`) VALUES
(7, 'ex1-1'),
(7, 'ex1-2'),
(7, 'ex7-4'),
(7, 'sv9-190'),
(9, 'sv5-178'),
(10, 'sv5-179'),
(11, 'ex6-73');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `collection`
--
ALTER TABLE `collection`
  ADD PRIMARY KEY (`id_card`),
  ADD KEY `id_card` (`id_card`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id` (`id`);

--
-- Indices de la tabla `user_collection`
--
ALTER TABLE `user_collection`
  ADD UNIQUE KEY `id_card` (`id_card`) USING BTREE,
  ADD KEY `id_user` (`id_user`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `user_collection`
--
ALTER TABLE `user_collection`
  ADD CONSTRAINT `user_collection_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_collection_ibfk_2` FOREIGN KEY (`id_card`) REFERENCES `collection` (`id_card`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
