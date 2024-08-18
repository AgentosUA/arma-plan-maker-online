'use client';

import { observer } from 'mobx-react-lite';

import { Header } from '@/widgets/header';

import { Footer } from '@/widgets/footer';

import styles from './page.module.scss';
import Image from 'next/image';
import { userEntity } from '@/entities/user/model';
import { useEffect } from 'react';
import { useUnAuthorizated } from '@/entities/user/ui/authorization/hook';
import { mapList } from '@/shared/data/map-list';
import { Button } from '@/shared/ui/atoms/button';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { useRouter } from 'next/navigation';
import { apmoApi, Plan } from '@/shared/sdk';
import { Modal } from '@/shared/ui/moleculas/modal/ui';

const Profile = observer(() => {
  useUnAuthorizated(userEntity);

  useEffect(() => {
    userEntity.getUser();
  }, []);

  const router = useRouter();

  const onCopyMarkers = (plan: Plan) => {
    navigator.clipboard.writeText(plan.planMarkers);

    toasterEntity.call({
      title: 'Markers copied',
      description: 'Markers copied to clipboard',
    });
  };

  const onViewPlan = (plan: Plan) => {
    router.push(`/plans/${plan.id}`);
  };

  const getPlanImage = (plan: Plan) => {
    return (
      mapList.find((map) => map?.dir === plan?.mission?.island?.toLowerCase())
        ?.image ?? 'maps/no-island.jpg'
    );
  };

  const getPlanIslandName = (plan: Plan) => {
    return (
      mapList.find((map) => map?.dir === plan?.mission?.island?.toLowerCase())
        ?.name ?? 'Unknown'
    );
  };

  const onDeletePlan = ({ id }: Plan) => {
    apmoApi.plan.delete({ id }).then(() => {
      if (!userEntity.user) return;

      userEntity.user.plans = userEntity.user.plans.filter(
        (plan) => plan.id !== id
      );
    });
  };

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <div className={styles.user}>
          <Image width={250} height={250} src='/avatar.jpg' alt='avatar' />
          <h2 className={styles.username}>{userEntity?.user?.username}</h2>
        </div>
        <div className={styles.plans}>
          <div className={styles.plansTitle}>My plans</div>
          {userEntity?.user?.plans?.map((plan) => (
            <div key={plan.id} className={styles.plan}>
              <Image
                className={styles.planImage}
                width={645}
                height={100}
                src={getPlanImage(plan)}
                alt='island'
              />
              <h3 className={styles.planTitle}>{plan?.mission?.missionName}</h3>
              <div className={styles.planFooter}>
                <p className={styles.planMap}>{getPlanIslandName(plan)}</p>
                <div className={styles.planActions}>
                  <Button
                    className={styles.planActionButton}
                    onClick={() => onViewPlan(plan)}
                    variant='bold'>
                    View
                  </Button>
                  <Button
                    className={styles.planActionButton}
                    variant='bold'
                    onClick={() => onCopyMarkers(plan)}>
                    Copy markers
                  </Button>
                  <Modal
                    title='Delete plan'
                    description='Are you sure you want to delete this plan?'
                    onConfirm={() => onDeletePlan(plan)}
                    onCancel
                    trigger={
                      <Button className={styles.planActionButton} variant='red'>
                        Delete
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
});

export default Profile;