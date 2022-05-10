﻿using ProEventos.Domain;
using ProEventosAPI.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProEventos.Application.Contratos
{
    public interface IEventoService
    {
        Task<EventoDto> AddEventos(int userId, EventoDto model);
        Task<EventoDto> UpdateEvento(int userId, int eventoID, EventoDto model);
        Task<bool> DeleteEvento(int userId, int eventoID);


        Task<EventoDto[]> GetAllEventosAsync(int userId, bool includePalestrantes = false);
        Task<EventoDto[]> GetAllEventosByTemaAsync(int userId, string tema, bool includePalestrantes = false);
        Task<EventoDto> GetAllEventoByIdAsync(int userId, int eventoID, bool includePalestrantes = false);
}
}
