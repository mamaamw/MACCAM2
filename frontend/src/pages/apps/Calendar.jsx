export default function Calendar() {
  const events = [
    { id: 1, title: 'Réunion Client TechCorp', time: '09:00 - 10:30', type: 'meeting', color: 'primary' },
    { id: 2, title: 'Présentation Projet Q1', time: '11:00 - 12:00', type: 'presentation', color: 'success' },
    { id: 3, title: 'Déjeuner d\'équipe', time: '12:30 - 13:30', type: 'lunch', color: 'warning' },
    { id: 4, title: 'Call avec InnoTech', time: '14:00 - 15:00', type: 'call', color: 'info' },
    { id: 5, title: 'Revue de code', time: '15:30 - 16:30', type: 'review', color: 'danger' },
  ]

  return (
    <>
      {/* [ Main Content ] start */}
      <div className="main-content">
        <div className="row">
          <div className="col-lg-12">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h4 className="mb-1">Calendrier</h4>
                <p className="mb-0 text-muted">Gérez vos événements et rendez-vous</p>
              </div>
              <button className="btn btn-primary">
                <i className="feather-plus me-2"></i>
                Nouvel Événement
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Calendar View */}
          <div className="col-lg-9">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <div className="d-flex align-items-center justify-content-between w-100">
                  <h5 className="card-title mb-0">Février 2026</h5>
                  <div className="hstack gap-2">
                    <button className="btn btn-sm btn-light-brand">
                      <i className="feather-chevron-left"></i>
                    </button>
                    <button className="btn btn-sm btn-light-brand">Aujourd'hui</button>
                    <button className="btn btn-sm btn-light-brand">
                      <i className="feather-chevron-right"></i>
                    </button>
                    <select className="form-select form-select-sm ms-2" style={{ width: 'auto' }}>
                      <option>Mois</option>
                      <option>Semaine</option>
                      <option>Jour</option>
                      <option>Agenda</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {/* Simple Calendar Grid */}
                <div className="table-responsive">
                  <table className="table table-bordered mb-0">
                    <thead>
                      <tr className="bg-light">
                        <th className="text-center p-3">Lun</th>
                        <th className="text-center p-3">Mar</th>
                        <th className="text-center p-3">Mer</th>
                        <th className="text-center p-3">Jeu</th>
                        <th className="text-center p-3">Ven</th>
                        <th className="text-center p-3">Sam</th>
                        <th className="text-center p-3">Dim</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(5)].map((_, weekIdx) => (
                        <tr key={weekIdx}>
                          {[...Array(7)].map((_, dayIdx) => {
                            const dayNum = weekIdx * 7 + dayIdx - 2
                            const isToday = dayNum === 13
                            const hasEvent = [5, 8, 12, 15, 20].includes(dayNum)
                            
                            return (
                              <td 
                                key={dayIdx} 
                                className={`text-center p-3 ${dayNum < 1 || dayNum > 29 ? 'text-muted bg-soft-secondary' : ''} ${isToday ? 'bg-soft-primary' : ''}`}
                                style={{ height: '100px', verticalAlign: 'top', cursor: 'pointer' }}
                              >
                                {dayNum > 0 && dayNum <= 29 && (
                                  <>
                                    <div className={`fw-bold mb-2 ${isToday ? 'text-primary' : ''}`}>{dayNum}</div>
                                    {hasEvent && (
                                      <div className="badge bg-soft-primary text-primary fs-10 mb-1">
                                        Événement
                                      </div>
                                    )}
                                  </>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Events */}
          <div className="col-lg-3">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Aujourd'hui</h5>
                <span className="badge bg-soft-primary text-primary">15 Fév</span>
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  {events.map((event) => (
                    <li key={event.id} className="mb-4 pb-4 border-bottom">
                      <div className={`d-flex align-items-start`}>
                        <div className={`wd-7 ht-7 bg-${event.color} rounded-circle me-3 mt-2`}></div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fs-13">{event.title}</h6>
                          <div className="hstack gap-2 mb-1">
                            <i className="feather-clock fs-11 text-muted"></i>
                            <span className="fs-11 text-muted">{event.time}</span>
                          </div>
                          <span className={`badge badge-soft-${event.color} fs-10`}>{event.type}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Add */}
            <div className="card stretch stretch-full mt-3">
              <div className="card-header">
                <h5 className="card-title">Ajout Rapide</h5>
              </div>
              <div className="card-body">
                <form>
                  <div className="mb-3">
                    <input type="text" className="form-control" placeholder="Titre de l'événement" />
                  </div>
                  <div className="mb-3">
                    <input type="datetime-local" className="form-control" />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    <i className="feather-plus me-2"></i>
                    Ajouter
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* [ Main Content ] end */}
    </>
  )
}
