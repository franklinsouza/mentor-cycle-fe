import Button from "@components/Button";
import Chip from "@components/Chip";
import DashboardCardProfile from "@components/DashboardCardProfile";
import MentoringWeekCard from "@components/MentoringWeekCard/MentoringWeekCard";
import { useMentorProfile } from "@hooks/useMentorProfile";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { ScheduleMentorshipModal } from "@components/ScheduleMentorshipModal";
import { validateUndefined } from "utils/nullable/validateUndefined";
import { useQuery } from "@apollo/client";
import {
  AvailabilitySlots,
  MentorAvailability,
} from "@components/ScheduleMentorshipModal/types";
import { GET_AVAILABILITIES } from "services/apollo/queries";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUser } from "@hooks/useUser";
import Spinner from "@components/Spinner";

const MentorProfile: NextPage = () => {
  const router = useRouter();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const { user } = useUser();

  const { id } = router.query;
  const { mentor, loading } = useMentorProfile(id as string);

  const { data } = useQuery<MentorAvailability>(GET_AVAILABILITIES, {
    variables: {
      mentorId: id,
    },
  });

  const availabilitiesByWeekDay =
    data?.findMentorAvailability.availability.reduce(
      (acc: AvailabilitySlots, availability) => {
        const weekDayNumber = availability.weekDay;
        const startDate = parseISO(availability.startDate);
        const formattedWeekDay = format(startDate, "EEEE", { locale: ptBR });

        if (!acc[weekDayNumber]) {
          acc[weekDayNumber] = {
            weekDay: formattedWeekDay,
            slots: [],
          };
        }
        acc[weekDayNumber].slots.push(`${availability.startHour}`);
        return acc;
      },
      {}
    );

  return (
    <main className="pb-12">
      {loading ? (
        <div className="h-screen flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="py-6 bg-header-dashboard min-h-[200px] bg-no-repeat bg-cover">
            <div className="flex justify-center sm:justify-start container">
              <DashboardCardProfile
                avatar={mentor.photoUrl || "/imgCard.png"}
                job={mentor.jobTitle || ""}
                name={`${mentor.firstName} ${mentor.lastName}`}
                skills={mentor?.skills || []}
              />
            </div>
          </div>

          <div className="container flex justify-between flex-wrap pt-8 gap-8">
            <div className="max-w-xl">
              <section>
                <h2 className="text-2xl font-bold leading-normal mb-4">
                  Sobre mim
                </h2>
                {mentor.biography ? (
                  <p className="text-base text-secondary-05">
                    {mentor.biography}
                  </p>
                ) : (
                  <p className="text-gray-05 text-base">Mentor</p>
                )}
              </section>
              <section className="mt-12 pb-12 border-secondary-01 border-b border-solid">
                <h2 className="text-2xl font-bold leading-normal mb-4">
                  Experiência profissional
                </h2>
                {mentor.description ? (
                  <p className="text-base text-secondary-05">
                    {mentor.description}
                  </p>
                ) : (
                  <p className="text-gray-05 text-base">
                    Escreva suas principais experiências profissionais
                  </p>
                )}
              </section>
              <section className="pt-12 flex flex-col sm:flex-row flex-wrap gap-y-8">
                {mentor.email ? (
                  <p className="font-bold basis-1/2">{mentor.email}</p>
                ) : (
                  <p className="text-gray-05 text-base">exemplo@gmail.com</p>
                )}
                {mentor.github ? (
                  <p className="font-bold basis-1/2">{mentor.github}</p>
                ) : (
                  <p className="text-gray-05 text-base">exemplo.com.br</p>
                )}
                {mentor.country ? (
                  <p className="font-bold basis-1/2">
                    {`${validateUndefined(mentor.country) || "País"}${
                      mentor.country === "Brasil" && mentor.state
                        ? `/${validateUndefined(mentor.state)}`
                        : ""
                    }`}
                  </p>
                ) : (
                  <p className="text-gray-05 text-base">País/Estado</p>
                )}

                {mentor.yearsOfExperience ? (
                  <p className="font-bold basis-1/2">{`${
                    +mentor.yearsOfExperience < 30
                      ? mentor.yearsOfExperience
                      : "30+"
                  } ${
                    +mentor.yearsOfExperience > 1 ? "anos" : "ano"
                  } de experiência`}</p>
                ) : (
                  <p className="text-gray-05 text-base">
                    experiência que você possui
                  </p>
                )}
              </section>
            </div>
            <section>
              <h2 className="text-3xl font-bold mb-12">Agenda de mentorias</h2>
              {data?.findMentorAvailability.availability.length ? (
                <div className="flex flex-col gap-4">
                  {availabilitiesByWeekDay &&
                    Object.values(availabilitiesByWeekDay).map(
                      (availability, index) => (
                        <MentoringWeekCard
                          key={availability.weekDay + index}
                          day={availability.weekDay}
                          description={
                            "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet."
                          }
                          chips={availability.slots.map((slot) => (
                            <Chip key={slot} variant="chipCards">
                              {slot}
                            </Chip>
                          ))}
                        />
                      )
                    )}
                </div>
              ) : (
                <div className="max-w-xs p-6 border border-gray-03 rounded-lg">
                  <p>O mentor ja está com a agenda lotada para a semana!</p>
                </div>
              )}
              <ScheduleMentorshipModal
                open={openModal}
                setOpen={setOpenModal}
              />
              {user.isMentor ? (
                <>
                  <div className="max-w-xs mt-4">
                    <Button size="small" disabled>
                      Vá até Configurações e altere seu perfil para agendar
                      mentorias.
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  className="mt-12"
                  size="regular"
                  variant="primary"
                  onClick={() => setOpenModal(true)}
                >
                  Agendar mentoria
                </Button>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  );
};

export default MentorProfile;
